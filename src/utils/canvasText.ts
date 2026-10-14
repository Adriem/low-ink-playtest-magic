import { drawWhenLoaded } from './canvasRendering';
import { getSymbolImage } from './symbols';

const FONT_SIZE_REGEX = /(\d+(?:\.\d+)?)px/;
const EMPTY_LINE_RELATIVE_SIZE = .25;
const PARAGRAPH_SPACING_RELATIVE_SIZE = .75;

/**
 * Automatically wrap a given text to fit inside an specified maximum width on
 * a canvas with a properly set font.
 *
 * @param text - Text to wrap within the given width
 * @param maxWidth - Maximum width where the text must be placed
 * @returns Array of strings containing the lines of text wrapped to fit in
 *   given width
 */
export const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
  const textWords = text.split(/\s+/);
  const lines: string[][] = [[]];

  for (const currentWord of textWords) {
    const currentLineWords = lines[lines.length - 1];
    const newLineText = [...currentLineWords, currentWord].join(' ');

    if (ctx.measureText(newLineText).width < maxWidth) {
      currentLineWords.push(currentWord)
    } else {
      lines.push([currentWord]);
    }
  }

  return lines.map(words => words.join(' '));
}

/**
 * Get the font size (in pixels) of the current canvas context
 *
 */
export const getFontSize = (ctx: CanvasRenderingContext2D): number => {
  const match = ctx.font.match(FONT_SIZE_REGEX);
  if (!match) throw new Error(`No font size in the canvas font: ${ctx.font}`);
  return Number(match[1]);
}

/**
 * Reduce the text size on the current canvas by the specified amount (by
 * default, 1px)
 *
 * NOTE: This method updates the canvas configuration
 *
 * @param reduceAmount - Amount (in pixels) to reduce the font size by
 */
export const reduceTextSize = (ctx: CanvasRenderingContext2D, reduceAmount = 1) => {
  const currentFont = getFontSize(ctx)
  ctx.font = ctx.font.replace(FONT_SIZE_REGEX, `${currentFont - reduceAmount}px`);
}

/**
 * Calculate the line height (in pixels) from a TextMetrics
 * fits within a specified max width.
 *
 * NOTE: This method updates the canvas configuration
 *
 * @returns Height in pixels of the given measures
 */
export const getLineHeight = (textMetrics: TextMetrics): number => {
  return textMetrics.fontBoundingBoxAscent + textMetrics.fontBoundingBoxDescent;
}

/**
 * Automatically reduce the font size of the canvas until a given text
 * fits within a specified max width.
 *
 * NOTE: This method updates the canvas configuration
 *
 * @param text - Text to fit in the given width
 * @param maxWidth - Maximum width where the text must be placed
 */
export const fitFontSizeInX = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number) => {
  while (ctx.measureText(text).width > maxWidth) reduceTextSize(ctx)
};

/**
 * Automatically reduce the font size of the canvas until a given text
 * wraps and fits within a specified max width and height.
 *
 * NOTE: This method updates the canvas configuration
 *
 * @param paragraphs - Text to fit in the given width
 * @param maxWidth - Maximum width where the text must be placed
 * @param maxHeight - Maximum height where the text must be placed
 * @returns Lines with the text wrapped ready to be displayed.
 */
export const fitFontSizeInXY = (ctx: CanvasRenderingContext2D, paragraphs: string[], maxWidth: number, maxHeight: number): string[] => {
  let textHeight;
  let textLines;
  do {
    const wrappedParagraphs = paragraphs.map(p => wrapText(ctx, p, maxWidth));

    // Separate paragraphs with empty lines and flatten lines
    textLines = wrappedParagraphs.reduce((lines, paragraph) => {
      if (lines.length) lines.push('');
      lines.push(...paragraph);
      return lines;
    });

    textHeight = textLines.reduce((height, line) => {
      const lineHeight = getLineHeight(ctx.measureText(line))

      return line
        ? height + lineHeight
        : height + lineHeight * EMPTY_LINE_RELATIVE_SIZE;
    }, 0);

    if (textHeight > maxHeight) reduceTextSize(ctx);
  } while (textHeight > maxHeight);

  return textLines;
};

export interface FittedParagraph {
  originalContent: string;
  lineHeight: number;
  paragraphHeight: number;
  lines: string[];
}

/**
 * Automatically reduce the font size of the canvas until a given text
 * wraps and fits within a specified max width and height.
 *
 * NOTE: This method updates the canvas configuration
 *
 * @param paragraphs - Text to fit in the given width
 * @param maxHeight - Maximum height where the text must be placed
 * @returns Lines with the text wrapped ready to be displayed.
 */
export const fitTextIntoBox = (
  ctx: CanvasRenderingContext2D,
  paragraphs: { content: string, width: number }[],
  maxHeight: number,
): FittedParagraph[] => {
  let textHeight;
  let processedParagraphs;

  do {
    const currentFont = getFontSize(ctx)

    processedParagraphs = paragraphs.map(({ content, width }, position) => {
      const lines = wrapText(ctx, content, width);

      const paragraphHeight = lines.reduce((totalHeight, line) => {
        return totalHeight + getLineHeight(ctx.measureText(line));
      }, 0);

      const paragraphHeightWithMargin = position === (paragraphs.length - 1)
        ? paragraphHeight
        : (paragraphHeight + currentFont * PARAGRAPH_SPACING_RELATIVE_SIZE)

      return {
        originalContent: content,
        lines,
        lineHeight: currentFont,
        paragraphHeight: paragraphHeightWithMargin,
      };
    });

    textHeight = processedParagraphs.reduce((totalHeight, { paragraphHeight }) => {
      return totalHeight + paragraphHeight;
    }, 0);

    if (textHeight > maxHeight) reduceTextSize(ctx);
  } while (textHeight > maxHeight);

  return processedParagraphs;
};

/**
 * Height of lines of text as drawn by `fillMultilineText`, from the top of the
 * first line to the bottom of the last one, with the current font.
 *
 * @param lines - Empty lines separate paragraphs
 */
export const getMultilineTextHeight = (ctx: CanvasRenderingContext2D, lines: string[]): number => {
  const { fontBoundingBoxAscent: ascent, fontBoundingBoxDescent: descent } = ctx.measureText('');
  const lineHeight = ascent + descent;

  return lines.reduce((height, line, index) => {
    if (index === 0) return lineHeight;
    return height + (line ? lineHeight : lineHeight * EMPTY_LINE_RELATIVE_SIZE);
  }, 0);
};

export const fillMultilineText = (ctx: CanvasRenderingContext2D, lines: string[], originX: number, originY: number) => {
  let currentBaseLine = originY;
  let previousFontSize: TextMetrics | null = null;

  for (const line of lines) {
    // Convert any symbol codes to a fixed-length character sequence that is
    // equivalent enough in width to the rendered images for the symbols. This
    // will help measuring the text length more accurately.
    const convertedLine = line.replace(/{.+?}/g, '‹::›');
    const currentFontSize = ctx.measureText(convertedLine);

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

export const renderTextWithSymbols = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number) => {
  const trimmedText = text.trim();
  const symbolChunksRegex = /(?:{.+?})+/g;
  const textChunks = trimmedText.split(symbolChunksRegex);
  const [...symbolChunks] = trimmedText.match(symbolChunksRegex) || [];

  const { fontBoundingBoxAscent, fontBoundingBoxDescent } = ctx.measureText('');
  const symbolSize = fontBoundingBoxAscent;
  const symbolPadding = 1;

  let currentX = x;

  for (let i = 0; i < textChunks.length; i++) {
    const textChunk = textChunks[i];

    ctx.fillText(textChunk, currentX, y);
    currentX += ctx.measureText(textChunk).width

    const symbolsChunk = symbolChunks[i];
    const [...symbolsList] = (symbolsChunk || '').match(/({.+?})/g) || [];

    for (const symbol of symbolsList) {
      const symbolX = currentX;
      const symbolY = y - symbolSize + (fontBoundingBoxAscent + fontBoundingBoxDescent - symbolSize) / 2;

      void drawWhenLoaded(ctx, getSymbolImage(symbol), (img) => {
        if (!img) return;
        ctx.drawImage(img, symbolX, symbolY, symbolSize, symbolSize);
      });

      currentX += symbolSize + symbolPadding;
    }

    // Correct last (unnecessary) padding
    if (symbolsList.length > 0) currentX -= symbolPadding;
  }
};