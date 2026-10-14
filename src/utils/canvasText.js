import { drawWhenLoaded } from './canvasRendering';
import { getSymbolImage } from './symbols';

const FONT_SIZE_REGEX = /(\d+(?:\.\d+)?)px/;
const EMPTY_LINE_RELATIVE_SIZE = .25;
const PARAGRAPH_SPACING_RELATIVE_SIZE = .75;

/**
 * Automatically wrap a given text to fit inside an specified maximum width on
 * a canvas with a properly set font.
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
 * @param {string} text - Text to wrap within the given width
 * @param {number} maxWidth - Maximum width where the text must be placed
 * @returns {string[]} Array of strings containing the lines of text wrapped to
 *                     fit in given width
 */
export const wrapText = (ctx, text, maxWidth) => {
  const textWords = text.split(/\s+/);
  const lines = [[]];

  while (textWords.length) {
    const currentLineWords = lines[lines.length - 1];
    const currentWord = textWords.shift();
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
 * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
 * @returns {number} Font size
 */
export const getFontSize = (ctx) => {
  const [, currentFont] = ctx.font.match(FONT_SIZE_REGEX);
  return Number(currentFont);
}

/**
 * Reduce the text size on the current canvas by the specified amount (by
 * default, 1px)
 *
 * NOTE: This method updates the canvas configuration
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
 * @param {number} reduceAmount - Amount (in pixels) to reduce the font size by
 */
export const reduceTextSize = (ctx, reduceAmount = 1) => {
  const currentFont = getFontSize(ctx)
  ctx.font = ctx.font.replace(FONT_SIZE_REGEX, `${currentFont - reduceAmount}px`);
}

/**
 * Calculate the line height (in pixels) from a TextMetrics
 * fits within a specified max width.
 *
 * NOTE: This method updates the canvas configuration
 *
 * @param {TextMetrics} textMetrics - Text metrics
 * @returns {number} Height in pixels of the given measures
 */
export const getLineHeight = (textMetrics) => {
  return textMetrics.fontBoundingBoxAscent + textMetrics.fontBoundingBoxDescent;
}

/**
 * Automatically reduce the font size of the canvas until a given text
 * fits within a specified max width.
 *
 * NOTE: This method updates the canvas configuration
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
 * @param {string} text - Text to fit in the given width
 * @param {number} maxWidth - Maximum width where the text must be placed
 */
export const fitFontSizeInX = (ctx, text, maxWidth) => {
  while (ctx.measureText(text).width > maxWidth) reduceTextSize(ctx)
};

/**
 * Automatically reduce the font size of the canvas until a given text
 * wraps and fits within a specified max width and height.
 *
 * NOTE: This method updates the canvas configuration
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
 * @param {string[]} paragraphs - Text to fit in the given width
 * @param {number} maxWidth - Maximum width where the text must be placed
 * @param {number} maxHeight - Maximum height where the text must be placed
 * @returns {string[]} Lines with the text wrapped ready to be displayed.
 */
export const fitFontSizeInXY = (ctx, paragraphs, maxWidth, maxHeight) => {
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

/**
 * Automatically reduce the font size of the canvas until a given text
 * wraps and fits within a specified max width and height.
 *
 * NOTE: This method updates the canvas configuration
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
 * @param {{content: string, width: number}[]} paragraphs - Text to fit in the given width
 * @param {number} maxHeight - Maximum height where the text must be placed
 * @returns {{
 *   originalContent: string,
 *   lineHeight: number,
 *   paragraphHeight: number,
 *   lines: string[],
 * }[]} Lines with the text wrapped ready to be displayed.
 */
export const fitTextIntoBox = (ctx, paragraphs, maxHeight) => {
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
 * @param {CanvasRenderingContext2D} ctx
 * @param {string[]} lines - Empty lines separate paragraphs
 * @returns {number}
 */
export const getMultilineTextHeight = (ctx, lines) => {
  const { fontBoundingBoxAscent: ascent, fontBoundingBoxDescent: descent } = ctx.measureText('');
  const lineHeight = ascent + descent;

  return lines.reduce((height, line, index) => {
    if (index === 0) return lineHeight;
    return height + (line ? lineHeight : lineHeight * EMPTY_LINE_RELATIVE_SIZE);
  }, 0);
};

export const fillMultilineText = (ctx, lines, originX, originY) => {
  let currentBaseLine = originY;
  let previousFontSize = null;

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

export const renderTextWithSymbols = (ctx, text, x, y) => {
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
        ctx.drawImage(img, symbolX, symbolY, symbolSize, symbolSize);
      });

      currentX += symbolSize + symbolPadding;
    }

    // Correct last (unnecessary) padding
    if (symbolsList.length > 0) currentX -= symbolPadding;
  }
};