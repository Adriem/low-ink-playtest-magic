import { drawRectangle } from '../../../utils/canvasShapes';
import { InkColors } from '../../../utils/colors';
import { parseSagaOracleText } from '../../../utils/sagaParser';
import {
  CONTENT_WIDTH,
  ORACLE_FONT_SIZE,
  ORACLE_TEXT_PADDING_X,
  ORACLE_TEXT_PADDING_Y,
  PINLINE_THICKNESS,
  SAGA_COLUMNS_TYPELINE_OVERLAP,
  SAGA_COLUMNS_Y,
  SAGA_TYPELINE_Y,
} from '../config';
import { drawArtImage } from './drawArtImage';
import { drawFramedBox } from './drawFramedBox';
import { drawOracleText, drawTextInArea } from './drawOracleText';

const CHAPTER_SEPARATOR_THICKNESS = 1;

/**
 * Draw the text of a saga in its column: the paragraphs before the chapters
 * (e.g. reminder text), each chapter and the paragraphs after them get the
 * same height, with a thin line above and below each chapter. Like the
 * minimalist style.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} cardOracleText
 * @param {object} column - Area inside the frame, between its pinlines
 * @returns {boolean} Whether the text had chapters to lay out
 */
const drawSagaChapters = (ctx, cardOracleText, { x, y, width, height }) => {
  const { topParagraphs, chapters, bottomParagraphs } = parseSagaOracleText(cardOracleText);
  if (chapters.length === 0) return false;

  // TODO: Draw the chapter numbers as icons instead of keeping them in the text
  const slots = [
    ...topParagraphs.map(content => ({ content, align: 'top' })),
    ...chapters.map(({ labels, text }) => ({ content: `${labels.join(', ')} — ${text}`, align: 'center', isChapter: true })),
    ...bottomParagraphs.map(content => ({ content, align: 'center' })),
  ];
  const slotHeight = height / slots.length;
  const textX = x + ORACLE_TEXT_PADDING_X;
  const textWidth = width - ORACLE_TEXT_PADDING_X * 2;

  slots.forEach(({ content, align, isChapter }, index) => {
    const slotY = y + index * slotHeight;

    drawTextInArea(ctx, {
      text: content,
      x: textX,
      y: slotY,
      width: textWidth,
      height: slotHeight,
      padding: ORACLE_TEXT_PADDING_Y,
      align,
    });

    // Line between this slot and the next one, when either is a chapter
    const nextSlot = slots[index + 1];
    if (nextSlot && (isChapter || nextSlot.isChapter)) {
      drawRectangle(ctx, {
        x,
        y: slotY + slotHeight - CHAPTER_SEPARATOR_THICKNESS / 2,
        width,
        height: CHAPTER_SEPARATOR_THICKNESS,
        fillStyle: InkColors.LINE,
      });
    }
  });

  return true;
};

/**
 * Draw the body of a saga: a single framed box from below the title to the
 * type line, split in half by a black line, with the oracle text on the left
 * and the art on the right.
 *
 * @param {object} options
 * @param {number} [options.typelineY] - Where the type line below the box starts
 */
export const drawSagaOracleAndArtBox = (ctx, {
  cardOracleText,
  cardArtUrl,
  cropArt,
  cardColorIdentity,
  typelineY = SAGA_TYPELINE_Y,
}) => {
  const x = (ctx.canvas.width - CONTENT_WIDTH) / 2;
  const y = SAGA_COLUMNS_Y;
  const width = CONTENT_WIDTH;
  const height = typelineY - y + SAGA_COLUMNS_TYPELINE_OVERLAP;
  const halfWidth = width / 2;

  const inner = drawFramedBox(ctx, {
    x,
    y,
    width,
    height,
    cardColorIdentity,
    shape: 'rectangle',
  });

  // Separator between the text and the art, as thick as the frame's pinline
  drawRectangle(ctx, {
    x: x + halfWidth - PINLINE_THICKNESS / 2,
    y: inner.y,
    width: PINLINE_THICKNESS,
    height: inner.height,
    fillStyle: InkColors.LINE,
  });

  // Text column: from the frame's inner pinline to the separator
  const textColumn = {
    x: inner.x + PINLINE_THICKNESS,
    y: inner.y + PINLINE_THICKNESS,
    width: (x + halfWidth - PINLINE_THICKNESS / 2) - (inner.x + PINLINE_THICKNESS),
    height: inner.height - PINLINE_THICKNESS * 2,
  };
  const hasChapters = drawSagaChapters(ctx, cardOracleText, textColumn);

  // Sagas without recognizable chapters get their text as a regular oracle box
  if (!hasChapters) {
    const textPaddingTop = ORACLE_FONT_SIZE + ORACLE_TEXT_PADDING_Y;
    drawOracleText(ctx, {
      cardOracleText,
      x: x + PINLINE_THICKNESS + ORACLE_TEXT_PADDING_X,
      y: y + PINLINE_THICKNESS + textPaddingTop,
      width: halfWidth - PINLINE_THICKNESS * 2 - ORACLE_TEXT_PADDING_X * 2,
      height: height - PINLINE_THICKNESS * 2 - textPaddingTop - ORACLE_TEXT_PADDING_Y,
    });
  }

  drawArtImage(ctx, {
    cardArtUrl,
    cropArt,
    x: x + halfWidth + PINLINE_THICKNESS + 2,
    y: y + PINLINE_THICKNESS + 2,
    width: halfWidth - PINLINE_THICKNESS * 2 - 4,
    height: height - PINLINE_THICKNESS * 2 - 4,
  });
};
