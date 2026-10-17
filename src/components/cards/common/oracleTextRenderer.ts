import { getSymbolImage } from '../../../adapters/scryfall';
import { splitReminderText, type TextRun } from '../../../domain/reminderText';
import { parseTextWithSymbols, splitSymbols, type CardSymbol } from '../../../domain/symbols';
import { drawWhenLoaded } from './canvasRendering';
import { EMPTY_LINE_RELATIVE_SIZE, getReminderFont } from './canvasText';

// Stands in for each symbol when measuring a line, as it's about as wide as their images
const SYMBOL_PLACEHOLDER = '‹::›';
const SYMBOL_PADDING = 1;

interface TextOptions {
  /** Whether to draw the reminder text, in parentheses, in italics, as in rules text */
  reminderText?: boolean;
}

/** A piece of a line, laid out: some text in a font, or a symbol */
type LinePiece = { kind: 'text'; text: string; font: string; width: number } | { kind: 'symbol'; symbol: CardSymbol };

/**
 * Draw lines of rules text, with their symbols as images and their reminder
 * text in italics. `originY` is the baseline of the first line, and empty
 * lines separate paragraphs.
 */
export const fillMultilineText = (
  ctx: CanvasRenderingContext2D,
  lines: string[],
  originX: number,
  originY: number,
  { reminderText = true }: TextOptions = {},
) => {
  let currentBaseLine = originY;
  let previousFontSize: TextMetrics | null = null;
  // Reminder texts can continue on the next lines, but not past the paragraph
  let inReminder = false;

  for (const line of lines) {
    const currentFontSize = ctx.measureText(toMeasurableLine(line));

    if (previousFontSize) {
      const previousLineFontDescent = previousFontSize.fontBoundingBoxDescent;
      const currentLineFontAscent = currentFontSize.fontBoundingBoxAscent;

      currentBaseLine += line
        ? previousLineFontDescent + currentLineFontAscent
        : (previousLineFontDescent + currentLineFontAscent) * EMPTY_LINE_RELATIVE_SIZE;
    }

    previousFontSize = currentFontSize;

    inReminder = line
      ? renderTextWithSymbols(ctx, line, originX, currentBaseLine, { reminderText, startsInReminder: inReminder })
      : false;
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
 * ascent and centered on the line, and its reminder text in italics. The line
 * is aligned as a whole, following the context's text alignment.
 *
 * @param options.startsInReminder - Whether the line continues a reminder text
 * @returns Whether the line ends inside a reminder text, which the next line continues
 */
export const renderTextWithSymbols = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  { reminderText = true, startsInReminder = false }: TextOptions & { startsInReminder?: boolean } = {},
): boolean => {
  const font = ctx.font;
  const textAlign = ctx.textAlign;
  const { fontBoundingBoxAscent, fontBoundingBoxDescent } = ctx.measureText('');
  const symbolSize = fontBoundingBoxAscent;
  const symbolY = y - symbolSize + (fontBoundingBoxAscent + fontBoundingBoxDescent - symbolSize) / 2;

  const { runs, endsInReminder }: { runs: TextRun[]; endsInReminder: boolean } = reminderText
    ? splitReminderText(text.trim(), startsInReminder)
    : { runs: [{ text: text.trim(), reminder: false }], endsInReminder: false };
  const pieces = layOutLine(ctx, runs);
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
  return endsInReminder;
};

/**
 * The pieces of a line, in order: its text, measured in the font of its run
 * (italic for reminder text), and its symbols.
 */
const layOutLine = (ctx: CanvasRenderingContext2D, runs: TextRun[]): LinePiece[] => {
  const font = ctx.font;

  const pieces = runs.flatMap(({ text, reminder }) => {
    const runFont = reminder ? getReminderFont(font) : font;
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
