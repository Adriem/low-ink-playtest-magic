const FONT_SIZE_REGEX = /(\d+(?:\.\d+)?)px/;
/** Height of empty lines, which separate paragraphs, relative to other lines */
export const EMPTY_LINE_RELATIVE_SIZE = 0.25;
const PARAGRAPH_SPACING_RELATIVE_SIZE = 0.75;
/** Smallest font size text is shrunk to, to fit it in a box */
const MIN_FONT_SIZE = 6;

/** Text in a single format */
export type FormattedText = { text: string; format: 'regular' | 'italic' };

/** Text in several formats, e.g. a paragraph or a line, as pieces in order */
export type RichText = FormattedText[];

export interface FittedParagraph {
  originalContent: RichText;
  lineHeight: number;
  paragraphHeight: number;
  /** Space above the text, centering it in its paragraph when the paragraph has a minimum height */
  textOffset: number;
  lines: RichText[];
}

/**
 * Automatically wrap a paragraph to fit inside a maximum width on a canvas
 * with a properly set font. Each piece is measured in its own format.
 *
 * @param paragraph - Rich text to wrap within the given width
 * @param maxWidth - Maximum width where the text must be placed
 * @returns Lines of text wrapped to fit in the given width
 */
export const wrapText = (ctx: CanvasRenderingContext2D, paragraph: RichText, maxWidth: number): RichText[] => {
  const words = paragraph.flatMap(({ text, format }) => {
    return text
      .split(/\s+/)
      .filter(Boolean)
      .map((word): FormattedText => ({ text: word, format }));
  });
  const lines: RichText[] = [[]];

  for (const word of words) {
    const currentLineWords = lines[lines.length - 1];

    if (measureRichTextWidth(ctx, toLine([...currentLineWords, word])) < maxWidth) {
      currentLineWords.push(word);
    } else {
      lines.push([word]);
    }
  }

  return lines.map(toLine);
};

/**
 * A line from its words: consecutive words in the same format make a single
 * piece, and the space between pieces ends the first of them.
 */
const toLine = (words: RichText): RichText => {
  return words.reduce<RichText>((line, word) => {
    const last = line.at(-1);
    if (last && last.format === word.format) {
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
  paragraphs: RichText[],
  maxWidth: number,
  maxHeight: number,
): RichText[] => {
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
      const lineHeight = getLineHeight(ctx.measureText(toPlainText(line)));

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
  paragraphs: { content: RichText; width: number; minHeight?: number }[],
  maxHeight: number,
): FittedParagraph[] => {
  let textHeight;
  let processedParagraphs;

  do {
    const currentFont = getFontSize(ctx);

    processedParagraphs = paragraphs.map(({ content, width, minHeight = 0 }, position) => {
      const lines = wrapText(ctx, content, width);

      const linesHeight = lines.reduce((totalHeight, line) => {
        return totalHeight + getLineHeight(ctx.measureText(toPlainText(line)));
      }, 0);
      const paragraphHeight = Math.max(linesHeight, minHeight);

      const paragraphHeightWithMargin =
        position === paragraphs.length - 1
          ? paragraphHeight
          : paragraphHeight + currentFont * PARAGRAPH_SPACING_RELATIVE_SIZE;

      return {
        originalContent: content,
        lines,
        lineHeight: currentFont,
        paragraphHeight: paragraphHeightWithMargin,
        textOffset: (paragraphHeight - linesHeight) / 2,
      };
    });

    textHeight = processedParagraphs.reduce((totalHeight, { paragraphHeight }) => {
      return totalHeight + paragraphHeight;
    }, 0);

    // Text that doesn't fit even at the smallest size (e.g. as the minimum heights alone don't) is left as it is
    if (textHeight > maxHeight && getFontSize(ctx) > MIN_FONT_SIZE) reduceTextSize(ctx);
    else break;
  } while (textHeight > maxHeight);

  return processedParagraphs;
};

/**
 * Height of lines of text as drawn by `fillMultilineText`, from the top of the
 * first line to the bottom of the last one, with the current font.
 *
 * @param lines - Empty lines separate paragraphs
 */
export const getMultilineTextHeight = (ctx: CanvasRenderingContext2D, lines: RichText[]): number => {
  const { fontBoundingBoxAscent: ascent, fontBoundingBoxDescent: descent } = ctx.measureText('');
  const lineHeight = ascent + descent;

  return lines.reduce((height, line, index) => {
    if (index === 0) return lineHeight;
    return height + (line.length ? lineHeight : lineHeight * EMPTY_LINE_RELATIVE_SIZE);
  }, 0);
};

/**
 * Width of some rich text with the current font, each piece in its format.
 */
export const measureRichTextWidth = (ctx: CanvasRenderingContext2D, richText: RichText): number => {
  if (richText.every(({ format }) => format === 'regular')) return ctx.measureText(toPlainText(richText)).width;

  const font = ctx.font;
  const width = richText.reduce((total, { text, format }) => {
    ctx.font = getFormattedFont(font, format);
    return total + ctx.measureText(text).width;
  }, 0);
  ctx.font = font;
  return width;
};

/**
 * A font in a format: italic text uses the font's italic variant.
 */
export const getFormattedFont = (font: string, format: FormattedText['format']): string => {
  return format === 'italic' ? `italic ${font}` : font;
};

/**
 * The text of some rich text, without its formats.
 */
export const toPlainText = (richText: RichText): string => {
  return richText.map(({ text }) => text).join('');
};
