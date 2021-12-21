const EMPTY_LINE_RELATIVE_SIZE = .25;
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
  while(ctx.measureText(text).width > maxWidth) {
    const [, currentFont] = ctx.font.match(/(\d+)px/);
    ctx.font = ctx.font.replace(/(\d+)px/, `${currentFont - 1}px`);
  }
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
      const lineMeasures = ctx.measureText(line);
      const lineHeight = lineMeasures.fontBoundingBoxAscent
        + lineMeasures.fontBoundingBoxDescent;

      return line
        ? height + lineHeight
        : height + lineHeight * EMPTY_LINE_RELATIVE_SIZE;
    }, 0);

    if (textHeight > maxHeight) {
      const [, currentFont] = ctx.font.match(/(\d+)px/);
      ctx.font = ctx.font.replace(/(\d+)px/, `${currentFont - 1}px`);
    }
  } while (textHeight > maxHeight);

  return textLines;
};

export const fillMultilineText = (ctx, lines, originX, originY) => {
  let currentBaseLine = originY;
  let previousFontSize = null;

  for (const line of lines) {
    const currentFontSize = ctx.measureText(line);

    if (previousFontSize) {
      const previousLineFontDescent = previousFontSize.fontBoundingBoxDescent;
      const currentLineFontAscent = currentFontSize.fontBoundingBoxAscent;

      currentBaseLine += !!line
        ? previousLineFontDescent + currentLineFontAscent
        : (previousLineFontDescent + currentLineFontAscent) * EMPTY_LINE_RELATIVE_SIZE;
    }

    previousFontSize = currentFontSize;

    ctx.fillText(line, originX, currentBaseLine);
  }
}