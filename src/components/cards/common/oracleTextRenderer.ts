import { getSymbolImage } from '../../../adapters/scryfall';
import { parseTextWithSymbols, splitSymbols } from '../../../domain/symbols';
import { drawWhenLoaded } from './canvasRendering';
import { EMPTY_LINE_RELATIVE_SIZE } from './canvasText';

// Stands in for each symbol when measuring a line, as it's about as wide as their images
const SYMBOL_PLACEHOLDER = '‹::›';
const SYMBOL_PADDING = 1;

/**
 * A line as measured: its text, with a placeholder for each symbol.
 */
const toMeasurableLine = (line: string) => parseTextWithSymbols(line)
  .map(chunk => chunk.chunkType === 'text' ? chunk.value : SYMBOL_PLACEHOLDER.repeat(splitSymbols(chunk.value).length))
  .join('');

/**
 * Draw lines of rules text, with their symbols as images. `originY` is the
 * baseline of the first line, and empty lines separate paragraphs.
 */
export const fillMultilineText = (ctx: CanvasRenderingContext2D, lines: string[], originX: number, originY: number) => {
  let currentBaseLine = originY;
  let previousFontSize: TextMetrics | null = null;

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

    renderTextWithSymbols(ctx, line, originX, currentBaseLine);
  }
};

/**
 * Draw a line of text with its symbols as images, as tall as the font's
 * ascent and centered on the line.
 */
export const renderTextWithSymbols = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number) => {
  const { fontBoundingBoxAscent, fontBoundingBoxDescent } = ctx.measureText('');
  const symbolSize = fontBoundingBoxAscent;
  const symbolY = y - symbolSize + (fontBoundingBoxAscent + fontBoundingBoxDescent - symbolSize) / 2;

  let currentX = x;

  for (const chunk of parseTextWithSymbols(text.trim())) {
    if (chunk.chunkType === 'text') {
      ctx.fillText(chunk.value, currentX, y);
      currentX += ctx.measureText(chunk.value).width;
      continue;
    }

    for (const symbol of splitSymbols(chunk.value)) {
      const symbolX = currentX;

      void drawWhenLoaded(ctx, getSymbolImage(symbol), (img) => {
        if (!img) return;
        ctx.drawImage(img, symbolX, symbolY, symbolSize, symbolSize);
      });

      currentX += symbolSize + SYMBOL_PADDING;
    }

    // Symbols are only padded between each other
    currentX -= SYMBOL_PADDING;
  }
};
