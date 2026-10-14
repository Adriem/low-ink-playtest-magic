import { drawRectangle, drawSagaChapter } from '../../../utils/canvasShapes';
import { InkColors } from '../../../utils/colors';
import { distributeHeight } from '../../../utils/layout';
import { parseSagaOracleText } from '../../../utils/sagaParser';
import {
  CONTENT_WIDTH,
  FONT_FAMILY,
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
import { drawOracleText, drawTextInArea, getFittingFontSize } from './drawOracleText';

const CHAPTER_SEPARATOR_THICKNESS = 1;
// Chapter numbers are hexagons centered on the column's left pinline, stacked
// when a chapter has several numbers
const CHAPTER_ICON_SPACING = 50;
const CHAPTER_ICON_HALF_WIDTH = 22.5 * Math.sqrt(3) / 2;
// Minimum height of each paragraph and chapter of the saga's text
const MIN_SLOT_HEIGHT = 75;
// Height of a hexagon chapter icon (at scale 1)
const CHAPTER_ICON_HEIGHT = 45;

/**
 * Draw the text of a saga in its column: the paragraphs before the chapters
 * (e.g. reminder text), each chapter and the paragraphs after them get a slot
 * as tall as their share of the text, like printed sagas, with a thin line
 * above and below each chapter, and its numbers as icons on the pinline to
 * its left. All the slots use the same font size: the largest at which every
 * slot's text fits.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} cardOracleText
 * @param {object} column - Area inside the frame, between its pinlines
 * @returns {boolean} Whether the text had chapters to lay out
 */
const drawSagaChapters = (ctx, cardOracleText, { x, y, width, height }) => {
  const { topParagraphs, chapters, bottomParagraphs } = parseSagaOracleText(cardOracleText);
  if (chapters.length === 0) return false;

  const slots = [
    ...topParagraphs.map(content => ({ content, align: 'top' })),
    ...chapters.map(({ labels, text }) => ({ content: text, labels, align: 'center', isChapter: true })),
    ...bottomParagraphs.map(content => ({ content, align: 'center' })),
  ];
  // Slots are as tall as their share of the characters (including spaces), but
  // at least the minimum height, and tall enough for a chapter's icons
  const slotHeights = distributeHeight(height, slots.map(({ content, labels }) => ({
    weight: content.length,
    minHeight: Math.max(MIN_SLOT_HEIGHT, (labels?.length ?? 0) * CHAPTER_ICON_SPACING),
    // When the minimums don't fit, slots get the same height, except that a
    // chapter still needs room for its icons
    requiredHeight: labels ? (labels.length - 1) * CHAPTER_ICON_SPACING + CHAPTER_ICON_HEIGHT : 0,
  })));
  const textRight = x + width - ORACLE_TEXT_PADDING_X;
  const iconX = x - PINLINE_THICKNESS / 2;
  // Chapter text starts after the chapter icons
  const chapterTextX = iconX + CHAPTER_ICON_HALF_WIDTH + ORACLE_TEXT_PADDING_X;

  const textAreas = slots.map(({ content, isChapter }, index) => {
    const textX = isChapter ? chapterTextX : x + ORACLE_TEXT_PADDING_X;
    return {
      text: content,
      x: textX,
      width: textRight - textX,
      height: slotHeights[index],
      padding: ORACLE_TEXT_PADDING_Y,
    };
  });
  const fontSize = Math.min(...textAreas.map(area => getFittingFontSize(ctx, area)));

  let slotY = y;
  slots.forEach(({ labels, align, isChapter }, index) => {
    const slotHeight = slotHeights[index];

    drawTextInArea(ctx, { ...textAreas[index], y: slotY, align, fontSize });

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

    if (isChapter) {
      const firstIconY = slotY + slotHeight / 2 - (labels.length - 1) * CHAPTER_ICON_SPACING / 2;
      labels.forEach((label, labelIndex) => {
        drawSagaChapter(ctx, {
          romanNumeral: label,
          x: iconX,
          y: firstIconY + labelIndex * CHAPTER_ICON_SPACING,
          fontFamily: FONT_FAMILY,
        });
      });
    }

    slotY += slotHeight;
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
