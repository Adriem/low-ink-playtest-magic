import { drawRectangle, drawSagaChapter } from '../../../utils/canvasShapes';
import { getColorIdentityStyle } from '../../../utils/canvasStyles';
import { fillMultilineText, fitTextIntoBox, getFontSize } from '../../../utils/canvasText';
import { InkColors, MinimalistColors } from '../../../utils/colors';
import { distributeHeight } from '../../../utils/layout';
import { parseSagaOracleText } from '../../../utils/sagaParser';
import {
  CONTENT_WIDTH,
  DISPLAY_FONT_FAMILY,
  ORACLE_FONT_SIZE,
  ORACLE_HEIGHT,
  ORACLE_Y,
  PINLINE_THICKNESS,
  SAGA_ORACLE_EXTENDED_EXTRA,
  SIDE_BORDER_PADDING,
  SIDE_BORDER_WIDTH,
} from '../config';
import { getSideBorderEdges } from './sideBorder';

const SAGA_CHAPTER_ICON_SPACING = 50;
const SAGA_TEXT_LEFT_OFFSET = 36;
const SAGA_CHAPTER_DIVIDER_HEIGHT = 1;
// Space between the side border and the text next to it
const SIDE_BORDER_TEXT_GAP = 8;
// Minimum height of each paragraph and chapter of the saga's text
const MIN_SLOT_HEIGHT = 75;
// Height of a hexagon chapter icon (at scale 1)
const CHAPTER_ICON_HEIGHT = 45;

const drawSagaOracleBorder = (ctx, { cardColorIdentity, x, y, height }) => {
  ctx.fillStyle = getColorIdentityStyle(ctx, cardColorIdentity, { palette: MinimalistColors });

  const { left: xOffsetL, right: xOffsetR } = getSideBorderEdges(x);
  const tipX = (xOffsetL + xOffsetR) / 2;
  const tipHeight = 16;

  ctx.beginPath();
  ctx.moveTo(xOffsetL, y);
  ctx.lineTo(xOffsetR, y);
  ctx.lineTo(xOffsetR, y + height - tipHeight);
  ctx.lineTo(tipX, y + height);
  ctx.lineTo(xOffsetL, y + height - tipHeight);
  ctx.closePath();

  ctx.fill();
};

export const drawSagaOracleBox = (ctx, {
  cardOracleText,
  cardColorIdentity,
  cardPower,
  cardToughness,
}) => {
  const hasStats = cardPower != null && cardToughness != null;

  const x = (ctx.canvas.width - CONTENT_WIDTH) / 2;
  const y = ORACLE_Y;
  const height = hasStats ? ORACLE_HEIGHT : ORACLE_HEIGHT + SAGA_ORACLE_EXTENDED_EXTRA;

  const textPaddingTop = 15;
  const textX = x;
  const textWidth = CONTENT_WIDTH;
  const textY = y + textPaddingTop;
  const textHeight = height - textPaddingTop;

  const { topParagraphs, chapters, bottomParagraphs } = parseSagaOracleText(cardOracleText);

  const contentLeftX = textX + SIDE_BORDER_PADDING;
  const contentWidth = textWidth - SIDE_BORDER_PADDING - SIDE_BORDER_WIDTH * 1.5;
  const chapterTextX = contentLeftX + SAGA_TEXT_LEFT_OFFSET;
  const chapterTextWidth = contentWidth - SAGA_TEXT_LEFT_OFFSET;
  const borderCenterX = textX + SIDE_BORDER_PADDING - SIDE_BORDER_WIDTH * 0.15;

  const dividerLeftX = textX + SIDE_BORDER_PADDING + SIDE_BORDER_WIDTH * 0.35 + 1;
  // Paragraphs before the chapters start after the side border, so they don't overlap it
  const topParagraphX = getSideBorderEdges(textX).right + SIDE_BORDER_TEXT_GAP;
  const dividerWidth = (contentLeftX + contentWidth) - dividerLeftX;

  // The paragraphs before the chapters (e.g. reminder text), each chapter and
  // the paragraphs after them get a slot as tall as their share of the
  // characters (including spaces), but at least the minimum height and tall
  // enough for a chapter's icons, like printed sagas
  const slots = [
    ...topParagraphs.map(content => ({ content, leftX: topParagraphX, width: contentLeftX + contentWidth - topParagraphX, align: 'top' })),
    ...chapters.map(({ labels, text }) => ({ content: text, labels, leftX: chapterTextX, width: chapterTextWidth, isChapter: true })),
    ...bottomParagraphs.map(content => ({ content, leftX: textX + textWidth / 2, width: contentWidth, isBottom: true })),
  ];
  const slotHeights = distributeHeight(textHeight, slots.map(({ content, labels }) => ({
    weight: content.length,
    minHeight: Math.max(MIN_SLOT_HEIGHT, (labels?.length ?? 0) * SAGA_CHAPTER_ICON_SPACING),
    // When the minimums don't fit, slots get the same height, except that a
    // chapter still needs room for its icons
    requiredHeight: labels ? (labels.length - 1) * SAGA_CHAPTER_ICON_SPACING + CHAPTER_ICON_HEIGHT : 0,
  })));

  const borderTopY = y;
  const chaptersEndY = textY + slotHeights
    .slice(0, topParagraphs.length + chapters.length)
    .reduce((sum, slotHeight) => sum + slotHeight, 0);
  const borderHeight = bottomParagraphs.length > 0
    ? chaptersEndY - borderTopY
    : height + 10;
  drawSagaOracleBorder(ctx, { cardColorIdentity, x: textX, y: borderTopY, height: borderHeight, width: textWidth });

  // All the slots use the same font size: the largest at which every slot's text fits
  const fitParagraph = (content, width, slotHeight, fontSize) => {
    ctx.font = `${fontSize}px ${DISPLAY_FONT_FAMILY}`;
    return fitTextIntoBox(ctx, [{ content, width }], slotHeight);
  };
  const fontSize = Math.min(...slots.map(({ content, width }, index) => {
    fitParagraph(content, width, slotHeights[index], ORACLE_FONT_SIZE);
    return getFontSize(ctx);
  }));

  ctx.fillStyle = InkColors.TEXT;

  let currentY = textY;
  slots.forEach(({ content, labels, leftX, width, align = 'center', isChapter, isBottom }, index) => {
    const slotY = currentY;
    const slotHeight = slotHeights[index];

    ctx.textAlign = isBottom ? 'center' : 'start';
    const fitted = fitParagraph(content, width, slotHeight, fontSize);
    const totalTextHeight = fitted.reduce((sum, p) => sum + p.paragraphHeight, 0);
    let paragraphY = align === 'top'
      ? slotY + ORACLE_FONT_SIZE * 0.7
      : slotY + slotHeight / 2 - totalTextHeight / 2 + ORACLE_FONT_SIZE * 0.7;
    for (const paragraph of fitted) {
      fillMultilineText(ctx, paragraph.lines, leftX, paragraphY);
      paragraphY += paragraph.paragraphHeight;
    }

    if (isChapter) {
      const iconBlockHeight = (labels.length - 1) * SAGA_CHAPTER_ICON_SPACING;
      const firstIconY = slotY + slotHeight / 2 - iconBlockHeight / 2;

      labels.forEach((label, labelIndex) => {
        drawSagaChapter(ctx, {
          romanNumeral: label,
          x: borderCenterX,
          y: firstIconY + labelIndex * SAGA_CHAPTER_ICON_SPACING,
          fontFamily: DISPLAY_FONT_FAMILY,
        });
      });
    }

    // Line between this slot and the next one, when either is a chapter
    const nextSlot = slots[index + 1];
    if (nextSlot && (isChapter || nextSlot.isChapter)) {
      drawRectangle(ctx, {
        x: dividerLeftX,
        y: slotY + slotHeight - SAGA_CHAPTER_DIVIDER_HEIGHT / 2,
        width: dividerWidth,
        height: SAGA_CHAPTER_DIVIDER_HEIGHT,
        fillStyle: InkColors.LINE,
      });
    }

    currentY += slotHeight;
  });
  ctx.textAlign = 'start';

  if (hasStats) {
    drawRectangle(ctx, {
      x: textX,
      y: y + height,
      width: textWidth,
      height: PINLINE_THICKNESS,
      fillStyle: getColorIdentityStyle(ctx, cardColorIdentity),
    });
  }
};
