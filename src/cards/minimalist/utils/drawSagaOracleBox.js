import { drawRectangle, drawSagaChapter } from '../../../utils/canvasShapes';
import { getColorIdentityStyle } from '../../../utils/canvasStyles';
import { fillMultilineText, fitTextIntoBox } from '../../../utils/canvasText';
import { MinimalistColors } from '../../../utils/colors';
import { parseSagaOracleText } from '../../../utils/sagaParser';
import { CONTENT_WIDTH, ORACLE_FONT_SIZE, ORACLE_HEIGHT, ORACLE_Y, PINLINE_THICKNESS } from '../config';

const SAGA_ORACLE_EXTRA_PADDING = 20;
const SAGA_ORACLE_BORDER_WIDTH = 16;
const SAGA_CHAPTER_ICON_SPACING = 50;
const SAGA_TEXT_LEFT_OFFSET = 36;
const SAGA_CHAPTER_DIVIDER_HEIGHT = 1;
const ORACLE_EXTENDED_EXTRA = 30;

const drawSagaOracleBorder = (ctx, { cardColorIdentity, x, y, height }) => {
  ctx.fillStyle = getColorIdentityStyle(ctx, cardColorIdentity, { palette: MinimalistColors });

  const xOffsetL = x + SAGA_ORACLE_EXTRA_PADDING - SAGA_ORACLE_BORDER_WIDTH * .65;
  const xOffsetR = x + SAGA_ORACLE_EXTRA_PADDING + SAGA_ORACLE_BORDER_WIDTH * .35;
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
  const height = hasStats ? ORACLE_HEIGHT : ORACLE_HEIGHT + ORACLE_EXTENDED_EXTRA;

  const textPaddingTop = 15;
  const textX = x;
  const textWidth = CONTENT_WIDTH;
  const textY = y + textPaddingTop;
  const textHeight = height - textPaddingTop;

  const { topParagraphs, chapters, bottomParagraphs } = parseSagaOracleText(cardOracleText);

  const contentLeftX = textX + SAGA_ORACLE_EXTRA_PADDING;
  const contentWidth = textWidth - SAGA_ORACLE_EXTRA_PADDING - SAGA_ORACLE_BORDER_WIDTH * 1.5;
  const chapterTextX = contentLeftX + SAGA_TEXT_LEFT_OFFSET;
  const chapterTextWidth = contentWidth - SAGA_TEXT_LEFT_OFFSET;
  const borderCenterX = textX + SAGA_ORACLE_EXTRA_PADDING - SAGA_ORACLE_BORDER_WIDTH * 0.15;

  const dividerLeftX = textX + SAGA_ORACLE_EXTRA_PADDING + SAGA_ORACLE_BORDER_WIDTH * 0.35 + 1;
  const dividerWidth = (contentLeftX + contentWidth) - dividerLeftX;

  const totalSlots = topParagraphs.length + chapters.length + bottomParagraphs.length;
  const slotHeight = totalSlots > 0 ? textHeight / totalSlots : 0;

  const borderTopY = y;
  const chaptersEndY = textY + (topParagraphs.length + chapters.length) * slotHeight;
  const borderHeight = bottomParagraphs.length > 0
    ? chaptersEndY - borderTopY
    : height + 10;
  drawSagaOracleBorder(ctx, { cardColorIdentity, x: textX, y: borderTopY, height: borderHeight, width: textWidth });

  ctx.font = `${ORACLE_FONT_SIZE}px Tahoma`;
  ctx.fillStyle = 'black';
  ctx.textAlign = 'start';

  const renderParagraph = (content, slotY, leftX, width, align = 'center') => {
    ctx.font = `${ORACLE_FONT_SIZE}px Tahoma`;
    const fitted = fitTextIntoBox(
      ctx,
      [{ content, width }],
      slotHeight,
    );
    const totalTextHeight = fitted.reduce((sum, p) => sum + p.paragraphHeight, 0);
    let paragraphY = align === 'top'
      ? slotY + ORACLE_FONT_SIZE * 0.7
      : slotY + slotHeight / 2 - totalTextHeight / 2 + ORACLE_FONT_SIZE * 0.7;
    for (const paragraph of fitted) {
      fillMultilineText(ctx, paragraph.lines, leftX, paragraphY);
      paragraphY += paragraph.paragraphHeight;
    }
  };

  let currentY = textY;

  topParagraphs.forEach((content) => {
    renderParagraph(content, currentY, contentLeftX, contentWidth, 'top');
    currentY += slotHeight;
  });

  chapters.forEach((chapter, chapterIndex) => {
    const groupY = currentY;
    const groupCenterY = groupY + slotHeight / 2;

    const iconBlockHeight = (chapter.labels.length - 1) * SAGA_CHAPTER_ICON_SPACING;
    const firstIconY = groupCenterY - iconBlockHeight / 2;

    chapter.labels.forEach((label, labelIndex) => {
      drawSagaChapter(ctx, {
        romanNumeral: label,
        x: borderCenterX,
        y: firstIconY + labelIndex * SAGA_CHAPTER_ICON_SPACING,
      });
    });

    renderParagraph(chapter.text, groupY, chapterTextX, chapterTextWidth);

    if (chapterIndex < chapters.length - 1) {
      drawRectangle(ctx, {
        x: dividerLeftX,
        y: groupY + slotHeight - SAGA_CHAPTER_DIVIDER_HEIGHT / 2,
        width: dividerWidth,
        height: SAGA_CHAPTER_DIVIDER_HEIGHT,
        fillStyle: 'black',
      });
    }

    currentY += slotHeight;
  });

  if (bottomParagraphs.length > 0) {
    drawRectangle(ctx, {
      x: dividerLeftX,
      y: chaptersEndY - SAGA_CHAPTER_DIVIDER_HEIGHT / 2,
      width: dividerWidth,
      height: SAGA_CHAPTER_DIVIDER_HEIGHT,
      fillStyle: 'black',
    });

    ctx.textAlign = 'center';
    const bottomCenterX = textX + textWidth / 2;
    bottomParagraphs.forEach((content) => {
      renderParagraph(content, currentY, bottomCenterX, contentWidth);
      currentY += slotHeight;
    });
    ctx.textAlign = 'start';
  }

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
