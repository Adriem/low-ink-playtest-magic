import { getSymbolImage } from '../../../adapters/scryfall';
import { parseTextWithSymbols, splitSymbols, type CardSymbol } from '../../../domain/symbols';
import { drawWhenLoaded } from './canvasRendering';
import { EMPTY_LINE_RELATIVE_SIZE, getItalicFont } from './canvasText';
import { getRunsText, type TextLine } from './textRuns';

// Stands in for each symbol when measuring a line, as it's about as wide as their images
const SYMBOL_PLACEHOLDER = '‹::›';
const SYMBOL_PADDING = 1;

/** A piece of a line, laid out: some text in a font, or a symbol */
type LinePiece = { kind: 'text'; text: string; font: string; width: number } | { kind: 'symbol'; symbol: CardSymbol };

/**
 * Draw lines of text, with their symbols as images and their italic runs
 * (e.g. names and reminder text) in italics. `originY` is the baseline of the
 * first line, and empty lines separate paragraphs.
 */
export const fillMultilineText = (
  ctx: CanvasRenderingContext2D,
  lines: TextLine[],
  originX: number,
  originY: number,
) => {
  let currentBaseLine = originY;
  let previousFontSize: TextMetrics | null = null;

  for (const line of lines) {
    const currentFontSize = ctx.measureText(toMeasurableLine(getRunsText(line)));

    if (previousFontSize) {
      const previousLineFontDescent = previousFontSize.fontBoundingBoxDescent;
      const currentLineFontAscent = currentFontSize.fontBoundingBoxAscent;

      currentBaseLine += line.length
        ? previousLineFontDescent + currentLineFontAscent
        : (previousLineFontDescent + currentLineFontAscent) * EMPTY_LINE_RELATIVE_SIZE;
    }

    previousFontSize = currentFontSize;

    renderTextWithSymbols(ctx, line, originX, currentBaseLine);
  }
};

/**
 * A line as measured: its text, with a placeholder for each symbol.
 */
const toMeasurableLine = (line: string) => {
  return parseTextWithSymbols(line)
    .map((chunk) =>
      chunk.chunkType === 'text' ? chunk.value : SYMBOL_PLACEHOLDER.repeat(splitSymbols(chunk.value).length),
    )
    .join('');
};

/**
 * Draw a line of text with its symbols as images, as tall as the font's
 * ascent and centered on the line, and its italic runs in italics. The line is
 * aligned as a whole, following the context's text alignment, without the
 * spaces around it.
 */
export const renderTextWithSymbols = (ctx: CanvasRenderingContext2D, line: TextLine, x: number, y: number) => {
  const font = ctx.font;
  const textAlign = ctx.textAlign;
  const { fontBoundingBoxAscent, fontBoundingBoxDescent } = ctx.measureText('');
  const symbolSize = fontBoundingBoxAscent;
  const symbolY = y - symbolSize + (fontBoundingBoxAscent + fontBoundingBoxDescent - symbolSize) / 2;

  const pieces = layOutLine(ctx, trimLine(line));
  const lineWidth = getLineWidth(pieces, symbolSize);

  let currentX =
    textAlign === 'center' ? x - lineWidth / 2 : textAlign === 'right' || textAlign === 'end' ? x - lineWidth : x;
  ctx.textAlign = 'left';

  pieces.forEach((piece, index) => {
    if (piece.kind === 'text') {
      ctx.font = piece.font;
      ctx.fillText(piece.text, currentX, y);
      currentX += piece.width;
      return;
    }

    const symbolX = currentX;
    void drawWhenLoaded(ctx, getSymbolImage(piece.symbol), (img) => {
      if (!img) return;
      ctx.drawImage(img, symbolX, symbolY, symbolSize, symbolSize);
    });

    currentX += symbolSize + (isFollowedBySymbol(pieces, index) ? SYMBOL_PADDING : 0);
  });

  ctx.font = font;
  ctx.textAlign = textAlign;
};

/**
 * A line without the spaces at its start and end.
 */
const trimLine = (line: TextLine): TextLine => {
  return line
    .map((run, index) => {
      const start = index === 0 ? run.text.trimStart() : run.text;
      return { ...run, text: index === line.length - 1 ? start.trimEnd() : start };
    })
    .filter((run) => run.text);
};

/**
 * The pieces of a line, in order: its text, measured in the font of its run,
 * and its symbols.
 */
const layOutLine = (ctx: CanvasRenderingContext2D, line: TextLine): LinePiece[] => {
  const font = ctx.font;

  const pieces = line.flatMap(({ text, italic }) => {
    const runFont = italic ? getItalicFont(font) : font;
    ctx.font = runFont;

    return parseTextWithSymbols(text).flatMap((chunk): LinePiece[] => {
      if (chunk.chunkType === 'symbols') {
        return splitSymbols(chunk.value).map((symbol) => ({ kind: 'symbol', symbol }));
      }
      return [{ kind: 'text', text: chunk.value, font: runFont, width: ctx.measureText(chunk.value).width }];
    });
  });

  ctx.font = font;
  return pieces;
};

/**
 * Width of a laid out line. Symbols are only padded between each other.
 */
const getLineWidth = (pieces: LinePiece[], symbolSize: number) => {
  return pieces.reduce((width, piece, index) => {
    if (piece.kind === 'text') return width + piece.width;
    return width + symbolSize + (isFollowedBySymbol(pieces, index) ? SYMBOL_PADDING : 0);
  }, 0);
};

const isFollowedBySymbol = (pieces: LinePiece[], index: number) => {
  return pieces[index + 1]?.kind === 'symbol';
};
