import { splitReminderText } from '../../../domain/reminderText';

const FONT_SIZE_REGEX = /(\d+(?:\.\d+)?)px/;
/** Height of empty lines, which separate paragraphs, relative to other lines */
export const EMPTY_LINE_RELATIVE_SIZE = 0.25;
const PARAGRAPH_SPACING_RELATIVE_SIZE = 0.75;

export interface FittedParagraph {
  originalContent: string;
  lineHeight: number;
  paragraphHeight: number;
  lines: string[];
}

/**
 * Automatically wrap a given text to fit inside an specified maximum width on
 * a canvas with a properly set font. Reminder text is measured in italics, as
 * it's drawn.
 *
 * @param text - Text to wrap within the given width
 * @param maxWidth - Maximum width where the text must be placed
 * @returns Array of strings containing the lines of text wrapped to fit in
 *   given width
 */
export const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
  const textWords = text.split(/\s+/);
  const lines: string[][] = [[]];
  // Whether the current line continues a reminder text from the previous one
  let lineStartsInReminder = false;

  for (const currentWord of textWords) {
    const currentLineWords = lines[lines.length - 1];
    const newLineText = [...currentLineWords, currentWord].join(' ');

    if (measureTextWidth(ctx, newLineText, lineStartsInReminder) < maxWidth) {
      currentLineWords.push(currentWord);
    } else {
      lineStartsInReminder = splitReminderText(currentLineWords.join(' '), lineStartsInReminder).endsInReminder;
      lines.push([currentWord]);
    }
  }

  return lines.map((words) => words.join(' '));
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
  paragraphs: string[],
  maxWidth: number,
  maxHeight: number,
): string[] => {
  let textHeight;
  let textLines;
  do {
    const wrappedParagraphs = paragraphs.map((p) => wrapText(ctx, p, maxWidth));

    // Separate paragraphs with empty lines and flatten lines
    textLines = wrappedParagraphs.reduce((lines, paragraph) => {
      if (lines.length) lines.push('');
      lines.push(...paragraph);
      return lines;
    });

    textHeight = textLines.reduce((height, line) => {
      const lineHeight = getLineHeight(ctx.measureText(line));

      return line ? height + lineHeight : height + lineHeight * EMPTY_LINE_RELATIVE_SIZE;
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
  paragraphs: { content: string; width: number }[],
  maxHeight: number,
): FittedParagraph[] => {
  let textHeight;
  let processedParagraphs;

  do {
    const currentFont = getFontSize(ctx);

    processedParagraphs = paragraphs.map(({ content, width }, position) => {
      const lines = wrapText(ctx, content, width);

      const paragraphHeight = lines.reduce((totalHeight, line) => {
        return totalHeight + getLineHeight(ctx.measureText(line));
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
export const getMultilineTextHeight = (ctx: CanvasRenderingContext2D, lines: string[]): number => {
  const { fontBoundingBoxAscent: ascent, fontBoundingBoxDescent: descent } = ctx.measureText('');
  const lineHeight = ascent + descent;

  return lines.reduce((height, line, index) => {
    if (index === 0) return lineHeight;
    return height + (line ? lineHeight : lineHeight * EMPTY_LINE_RELATIVE_SIZE);
  }, 0);
};

/**
 * Width of a text with the current font, with its reminder text in italics.
 *
 * @param startsInReminder - Whether the text continues a reminder text
 */
export const measureTextWidth = (ctx: CanvasRenderingContext2D, text: string, startsInReminder = false): number => {
  const { runs } = splitReminderText(text, startsInReminder);
  if (runs.every((run) => !run.reminder)) return ctx.measureText(text).width;

  const font = ctx.font;
  const width = runs.reduce((total, run) => {
    ctx.font = run.reminder ? getReminderFont(font) : font;
    return total + ctx.measureText(run.text).width;
  }, 0);
  ctx.font = font;
  return width;
};

/**
 * Italic variant of a font, for reminder text.
 */
export const getReminderFont = (font: string): string => {
  return `italic ${font}`;
};
