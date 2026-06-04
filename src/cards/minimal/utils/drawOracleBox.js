import {
  drawLoyaltyMinus,
  drawLoyaltyPlus,
  drawLoyaltyZero,
  drawRectangle,
} from '../../../utils/canvasShapes';
import { getColorIdentityStyle } from '../../../utils/canvasStyles';
import { fillMultilineText, fitTextIntoBox } from '../../../utils/canvasText';
import { MinimalistColors } from '../../../utils/colors';
import { CONTENT_WIDTH, ORACLE_FONT_SIZE, ORACLE_HEIGHT, ORACLE_Y, PINLINE_THICKNESS } from '../config';

const LOYALTY_COST_REGEX = /^[+−-]?(\d+|X):/; // There is a weird character here! D:
const LOYALTY_ABILITY_OFFSET = 45;
const PLANESWALKER_ORACLE_EXTRA_PADDING = 20;
const PLANESWALKER_ORACLE_BORDER_WIDTH = 16;
const ORACLE_EXTENDED_EXTRA = 40;
const DIVIDER_TEXT_PADDING = 8;

const drawSubCardDivider = (ctx, { cardColorIdentity, height }) => {
  drawRectangle(ctx, {
    x: (ctx.canvas.width - PINLINE_THICKNESS) / 2,
    y: ORACLE_Y,
    width: PINLINE_THICKNESS,
    height: height,
    fillStyle: getColorIdentityStyle(ctx, cardColorIdentity),
  });
};

const drawOracleBorder = (ctx, { cardColorIdentity, layout, y }) => {
  const x = layout === 'right-half'
    ? ctx.canvas.width / 2 - PINLINE_THICKNESS / 2
    : (ctx.canvas.width - CONTENT_WIDTH) / 2;
  const width = layout === 'full-width'
    ? CONTENT_WIDTH
    : CONTENT_WIDTH / 2 + PINLINE_THICKNESS / 2;

  drawRectangle(ctx, {
    x,
    y,
    width,
    height: PINLINE_THICKNESS,
    fillStyle: getColorIdentityStyle(ctx, cardColorIdentity),
  });
};

export const drawOracleBox = (ctx, {
  cardOracleText,
  cardColorIdentity,
  cardPower,
  cardToughness,
  cardLoyalty,
  layout,
}) => {
  const hasStats = (cardPower != null && cardToughness != null) || cardLoyalty != null;

  const x = layout === 'right-half'
    ? ctx.canvas.width / 2 + PINLINE_THICKNESS / 2
    : (ctx.canvas.width - CONTENT_WIDTH) / 2;
  const y = ORACLE_Y;
  const width = layout === 'full-width'
    ? CONTENT_WIDTH
    : (CONTENT_WIDTH - PINLINE_THICKNESS) / 2;
  const height = hasStats ? ORACLE_HEIGHT : ORACLE_HEIGHT + ORACLE_EXTENDED_EXTRA;

  if (layout !== 'full-width') {
    drawSubCardDivider(ctx, { cardColorIdentity, y, height });
  }
  drawOracleBorder(ctx, { cardColorIdentity, layout, y: y + height });

  const textPaddingX = layout === 'full-width' ? 0 : DIVIDER_TEXT_PADDING;
  const textX = layout === 'right-half' ? x + textPaddingX : x;
  const textWidth = width - textPaddingX;

  const textPaddingTop = 50;
  const textPaddingBottom = 0;
  const textY = y + textPaddingTop;
  const textHeight = height - textPaddingTop - textPaddingBottom;

  ctx.font = `${ORACLE_FONT_SIZE}px Verdana`;
  ctx.fillStyle = 'black';
  ctx.textAlign = 'start';

  const paragraphs = fitTextIntoBox(
    ctx,
    (cardOracleText ?? '').split('\n').map(content => ({ content, width: textWidth })),
    textHeight,
  );

  let currentY = textY;
  for (const paragraph of paragraphs) {
    fillMultilineText(ctx, paragraph.lines, textX, currentY);
    currentY += paragraph.paragraphHeight;
  }

};

const drawPlaneswalkerOracleBorder = (ctx, { cardColorIdentity, x, y, height }) => {
  ctx.fillStyle = getColorIdentityStyle(ctx, cardColorIdentity, { palettte: MinimalistColors });

  const xOffsetL = x + PLANESWALKER_ORACLE_EXTRA_PADDING - PLANESWALKER_ORACLE_BORDER_WIDTH * .65;
  const xOffsetR = x + PLANESWALKER_ORACLE_EXTRA_PADDING + PLANESWALKER_ORACLE_BORDER_WIDTH * .35;

  ctx.beginPath();
  ctx.moveTo(xOffsetL - 15, y);
  ctx.ellipse(xOffsetL - 15, y + 20, 15, 20, 0, 1.5 * Math.PI, 0);
  ctx.ellipse(xOffsetL + 100, y + height - 60, 100, 60, 0, Math.PI, 0.5 * Math.PI, true);
  ctx.ellipse(xOffsetR + 100, y + height - 60, 100, 60, 0, 0.5 * Math.PI, Math.PI);
  ctx.ellipse(xOffsetR + 35, y + 25, 35, 25, 0, Math.PI, 1.5 * Math.PI, false);
  ctx.closePath();

  ctx.fill();
};

export const drawPlaneswalkerOracleBox = (ctx, {
  cardOracleText,
  cardColorIdentity,
  layout,
}) => {
  const x = layout === 'right-half'
    ? ctx.canvas.width / 2 + PINLINE_THICKNESS / 2
    : (ctx.canvas.width - CONTENT_WIDTH) / 2;
  const y = ORACLE_Y;
  const width = layout === 'full-width'
    ? CONTENT_WIDTH
    : (CONTENT_WIDTH - PINLINE_THICKNESS) / 2;
  const height = ORACLE_HEIGHT + ORACLE_EXTENDED_EXTRA;

  const textPaddingX = layout === 'full-width' ? 0 : DIVIDER_TEXT_PADDING;
  const textX = layout === 'right-half' ? x + textPaddingX : x;
  const textWidth = width - textPaddingX;
  const textY = y;
  const textHeight = height;

  const paddedX = textX + PLANESWALKER_ORACLE_EXTRA_PADDING;
  const loyaltyAbilityWidth = textWidth - PLANESWALKER_ORACLE_EXTRA_PADDING - LOYALTY_ABILITY_OFFSET;
  const regularOracleWidth = textWidth - PLANESWALKER_ORACLE_EXTRA_PADDING - PLANESWALKER_ORACLE_BORDER_WIDTH * 1.5;

  drawPlaneswalkerOracleBorder(ctx, { cardColorIdentity, x: textX, y: textY - 50, height: textHeight + 60, width: textWidth });

  if (layout !== 'full-width') {
    drawSubCardDivider(ctx, { cardColorIdentity, y, height });
  }

  ctx.font = `${ORACLE_FONT_SIZE}px Tahoma`;
  ctx.fillStyle = 'black';
  ctx.textAlign = 'start';

  const originalParagraphs = (cardOracleText ?? '').split('\n');

  const paragraphs = fitTextIntoBox(
    ctx,
    originalParagraphs.map(content => {
      const isLoyaltyAbility = LOYALTY_COST_REGEX.test(content);

      return {
        content: isLoyaltyAbility ? content.replace(LOYALTY_COST_REGEX, '').trim() : content,
        width: isLoyaltyAbility ? loyaltyAbilityWidth : regularOracleWidth,
      };
    }),
    textHeight,
  );

  let currentY = textY;
  for (const [index, paragraph] of paragraphs.entries()) {
    const originalParagraph = originalParagraphs[index];
    const isLoyaltyAbility = LOYALTY_COST_REGEX.test(originalParagraph);

    if (isLoyaltyAbility) {
      fillMultilineText(ctx, paragraph.lines, paddedX + LOYALTY_ABILITY_OFFSET, currentY);
    } else {
      fillMultilineText(ctx, paragraph.lines, paddedX + PLANESWALKER_ORACLE_BORDER_WIDTH * 1.5, currentY);
    }

    currentY += paragraph.paragraphHeight;
  }

  currentY = textY;
  for (const [index, paragraph] of paragraphs.entries()) {
    const originalParagraph = originalParagraphs[index];
    const isLoyaltyAbility = LOYALTY_COST_REGEX.test(originalParagraph);

    if (isLoyaltyAbility) {
      const [abilityCost] = originalParagraph.match(LOYALTY_COST_REGEX);
      const parsedAbilityCost = abilityCost.replace(':', '');

      const drawLoyaltyCost = parsedAbilityCost.startsWith('+')
        ? drawLoyaltyPlus
        : parsedAbilityCost === '0'
          ? drawLoyaltyZero
          : drawLoyaltyMinus;

      drawLoyaltyCost(ctx, {
        loyaltyCost: parsedAbilityCost,
        x: paddedX,
        y: currentY + (paragraph.lineHeight * (paragraph.lines.length - 1) / 2),
        scale: 1.1,
        fontFamily: 'Tahoma',
      });
    }

    currentY += paragraph.paragraphHeight;
  }
};
