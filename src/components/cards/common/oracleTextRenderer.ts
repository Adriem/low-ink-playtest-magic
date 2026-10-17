import { getSymbolImage } from '../../../adapters/scryfall';
import { isLoyaltyAbility, type CardAbility, type OracleLine } from '../../../domain/oracleText';
import { parseTextWithSymbols, splitSymbols, type CardSymbol } from '../../../domain/symbols';
import { drawWhenLoaded } from './canvasRendering';
import {
  EMPTY_LINE_RELATIVE_SIZE,
  fitFontSizeInXY,
  fitTextIntoBox,
  getFormattedFont,
  toPlainText,
  type FittedParagraph,
  type RichText,
} from './canvasText';

// Stands in for each symbol when measuring a line, as it's about as wide as their images
const SYMBOL_PLACEHOLDER = '‹::›';
const SYMBOL_PADDING = 1;
const MODE_PREFIX = '• ';
const NAME_SEPARATOR = ' — ';

interface OracleTextOptions {
  /** Whether to write the loyalty cost before the text of loyalty abilities, e.g. "+1: Draw a card." */
  loyaltyCostsAsText?: boolean;
}

/** A paragraph of oracle text fitted into a box: a line, or one of its modes */
export type FittedOracleParagraph = FittedParagraph & { line: OracleLine; isMode: boolean };

/** A piece of a line, laid out: some text in a font, or a symbol */
type LinePiece = { kind: 'text'; text: string; font: string; width: number } | { kind: 'symbol'; symbol: CardSymbol };

/**
 * Wrap the lines of oracle text to fit in an area, shrinking the font until
 * they do. Each line, and each of its modes, is a paragraph.
 *
 * @returns The wrapped lines, with empty lines between paragraphs
 */
export const fitOracleLines = (
  ctx: CanvasRenderingContext2D,
  lines: OracleLine[],
  maxWidth: number,
  maxHeight: number,
  options: OracleTextOptions = {},
): RichText[] => {
  return fitFontSizeInXY(ctx, toParagraphs(lines, options), maxWidth, maxHeight);
};

/**
 * Fit the lines of oracle text into a box, shrinking the font until they do,
 * as a paragraph for each line and each of its modes.
 *
 * @param width - Width of the paragraphs, or of each line's paragraphs
 */
export const fitOracleLinesIntoBox = (
  ctx: CanvasRenderingContext2D,
  lines: OracleLine[],
  width: number | ((line: OracleLine) => number),
  maxHeight: number,
  options: OracleTextOptions = {},
): FittedOracleParagraph[] => {
  const paragraphs = lines.flatMap((line) => {
    return toLineParagraphs(line, options).map((content, index) => ({ content, line, isMode: index > 0 }));
  });
  const fitted = fitTextIntoBox(
    ctx,
    paragraphs.map(({ content, line }) => ({ content, width: typeof width === 'function' ? width(line) : width })),
    maxHeight,
  );

  return fitted.map((paragraph, index) => ({
    ...paragraph,
    line: paragraphs[index].line,
    isMode: paragraphs[index].isMode,
  }));
};

/**
 * Length of the text of some lines of oracle text, with their modes.
 */
export const getOracleTextLength = (lines: OracleLine[]): number => {
  return toParagraphs(lines).reduce((length, paragraph) => length + toPlainText(paragraph).length, 0);
};

/**
 * Draw lines of text, with their symbols as images and their italic pieces
 * (e.g. names and reminder text) in italics. `originY` is the baseline of the
 * first line, and empty lines separate paragraphs.
 */
export const fillMultilineText = (
  ctx: CanvasRenderingContext2D,
  lines: RichText[],
  originX: number,
  originY: number,
) => {
  let currentBaseLine = originY;
  let previousFontSize: TextMetrics | null = null;

  for (const line of lines) {
    const currentFontSize = ctx.measureText(toMeasurableLine(toPlainText(line)));

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
 * ascent and centered on the line, and its italic pieces in italics. The line is
 * aligned as a whole, following the context's text alignment, without the
 * spaces around it.
 */
export const renderTextWithSymbols = (ctx: CanvasRenderingContext2D, line: RichText, x: number, y: number) => {
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
const trimLine = (line: RichText): RichText => {
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
const layOutLine = (ctx: CanvasRenderingContext2D, line: RichText): LinePiece[] => {
  const font = ctx.font;

  const pieces = line.flatMap(({ text, format }) => {
    const runFont = getFormattedFont(font, format);
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

/**
 * Paragraphs for the lines of oracle text: each line, followed by its modes.
 */
const toParagraphs = (lines: OracleLine[], options: OracleTextOptions = {}): RichText[] => {
  return lines.flatMap((line) => toLineParagraphs(line, options));
};

/**
 * Paragraphs for a line of oracle text: the line, followed by a "• "
 * paragraph for each of its modes.
 */
const toLineParagraphs = (line: OracleLine, { loyaltyCostsAsText = false }: OracleTextOptions): RichText[] => {
  const prefix: RichText =
    loyaltyCostsAsText && isLoyaltyAbility(line) ? [{ text: `${line.loyaltyCost}: `, format: 'regular' }] : [];

  return [
    [...prefix, ...toRichText(line)],
    ...(line.modes ?? []).map((mode): RichText => [{ text: MODE_PREFIX, format: 'regular' }, ...toRichText(mode)]),
  ];
};

/**
 * An ability as rich text: its name in italics, its rules text, then its
 * reminder text in italics.
 */
const toRichText = ({ name, text, reminderText }: CardAbility): RichText => {
  const richText: RichText = [];
  if (name) richText.push({ text: name, format: 'italic' }, { text: NAME_SEPARATOR, format: 'regular' });
  if (text) richText.push({ text, format: 'regular' });
  if (reminderText) {
    if (text) richText.push({ text: ' ', format: 'regular' });
    richText.push({ text: reminderText, format: 'italic' });
  }
  return richText;
};
