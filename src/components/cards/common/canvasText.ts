import { getRunsText, type TextLine, type TextRun } from './textRuns';

const FONT_SIZE_REGEX = /(\d+(?:\.\d+)?)px/;
/** Height of empty lines, which separate paragraphs, relative to other lines */
export const EMPTY_LINE_RELATIVE_SIZE = 0.25;
const PARAGRAPH_SPACING_RELATIVE_SIZE = 0.75;

export interface FittedParagraph {
  originalContent: TextRun[];
  lineHeight: number;
  paragraphHeight: number;
  lines: TextLine[];
}

/**
 * Automatically wrap a paragraph to fit inside a maximum width on a canvas
 * with a properly set font. Each run is measured in its own style.
 *
 * @param paragraph - Runs of text to wrap within the given width
 * @param maxWidth - Maximum width where the text must be placed
 * @returns Lines of text wrapped to fit in the given width
 */
export const wrapText = (ctx: CanvasRenderingContext2D, paragraph: TextRun[], maxWidth: number): TextLine[] => {
  const words = paragraph.flatMap(({ text, italic }) => {
    return text
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => ({ text: word, italic }));
  });
  const lines: TextRun[][] = [[]];

  for (const word of words) {
    const currentLineWords = lines[lines.length - 1];

    if (measureRunsWidth(ctx, toLine([...currentLineWords, word])) < maxWidth) {
      currentLineWords.push(word);
    } else {
      lines.push([word]);
    }
  }

  return lines.map(toLine);
};

/**
 * A line from its words: consecutive words in the same style make a single
 * run, and the space between runs ends the first of them.
 */
const toLine = (words: TextRun[]): TextLine => {
  return words.reduce<TextLine>((line, word) => {
    const last = line.at(-1);
    if (last && Boolean(last.italic) === Boolean(word.italic)) {
      last.text = `${last.text} ${word.text}`;
    } else {
      if (last) last.text += ' ';
      line.push({ ...word });
    }
    return line;
  }, []);
};

/**
 * Get the font size (in pixels) of the current canvas context
 *
 */
export const getFontSize = (ctx: CanvasRenderingContext2D): number => {
  const match = ctx.font.match(FONT_SIZE_REGEX);
  if (!match) throw new Error(`No font size in the canvas font: ${ctx.font}`);
  return Number(match[1]);
};

/**
 * Reduce the text size on the current canvas by the specified amount (by
 * default, 1px)
 *
 * NOTE: This method updates the canvas configuration
 *
 * @param reduceAmount - Amount (in pixels) to reduce the font size by
 */
export const reduceTextSize = (ctx: CanvasRenderingContext2D, reduceAmount = 1) => {
  const currentFont = getFontSize(ctx);
  ctx.font = ctx.font.replace(FONT_SIZE_REGEX, `${currentFont - reduceAmount}px`);
};

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
};

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
  while (ctx.measureText(text).width > maxWidth) reduceTextSize(ctx);
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
export const fitFontSizeInXY = (
  ctx: CanvasRenderingContext2D,
  paragraphs: TextRun[][],
  maxWidth: number,
  maxHeight: number,
): TextLine[] => {
  if (paragraphs.length === 0) return [];

  let textHeight;
  let textLines;
  do {
    const wrappedParagraphs = paragraphs.map((p) => wrapText(ctx, p, maxWidth));

    // Separate paragraphs with empty lines and flatten lines
    textLines = wrappedParagraphs.reduce((lines, paragraph) => {
      if (lines.length) lines.push([]);
      lines.push(...paragraph);
      return lines;
    });

    textHeight = textLines.reduce((height, line) => {
      const lineHeight = getLineHeight(ctx.measureText(getRunsText(line)));

      return line.length ? height + lineHeight : height + lineHeight * EMPTY_LINE_RELATIVE_SIZE;
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
 * @param paragraphs - Text to fit in the given width
 * @param maxHeight - Maximum height where the text must be placed
 * @returns Lines with the text wrapped ready to be displayed.
 */
export const fitTextIntoBox = (
  ctx: CanvasRenderingContext2D,
  paragraphs: { content: TextRun[]; width: number }[],
  maxHeight: number,
): FittedParagraph[] => {
  let textHeight;
  let processedParagraphs;

  do {
    const currentFont = getFontSize(ctx);

    processedParagraphs = paragraphs.map(({ content, width }, position) => {
      const lines = wrapText(ctx, content, width);

      const paragraphHeight = lines.reduce((totalHeight, line) => {
        return totalHeight + getLineHeight(ctx.measureText(getRunsText(line)));
      }, 0);

      const paragraphHeightWithMargin =
        position === paragraphs.length - 1
          ? paragraphHeight
          : paragraphHeight + currentFont * PARAGRAPH_SPACING_RELATIVE_SIZE;

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
export const getMultilineTextHeight = (ctx: CanvasRenderingContext2D, lines: TextLine[]): number => {
  const { fontBoundingBoxAscent: ascent, fontBoundingBoxDescent: descent } = ctx.measureText('');
  const lineHeight = ascent + descent;

  return lines.reduce((height, line, index) => {
    if (index === 0) return lineHeight;
    return height + (line.length ? lineHeight : lineHeight * EMPTY_LINE_RELATIVE_SIZE);
  }, 0);
};

/**
 * Width of some runs of text with the current font, each in its style.
 */
export const measureRunsWidth = (ctx: CanvasRenderingContext2D, runs: TextRun[]): number => {
  if (runs.every((run) => !run.italic)) return ctx.measureText(getRunsText(runs)).width;

  const font = ctx.font;
  const width = runs.reduce((total, run) => {
    ctx.font = run.italic ? getItalicFont(font) : font;
    return total + ctx.measureText(run.text).width;
  }, 0);
  ctx.font = font;
  return width;
};

/**
 * Italic variant of a font.
 */
export const getItalicFont = (font: string): string => {
  return `italic ${font}`;
};
