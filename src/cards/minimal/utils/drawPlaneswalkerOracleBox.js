import {
  drawLoyaltyMinus,
  drawLoyaltyPlus,
  drawLoyaltyZero,
} from '../../../utils/canvasShapes';
import { getColorIdentityStyle } from '../../../utils/canvasStyles';
import { fillMultilineText, fitTextIntoBox } from '../../../utils/canvasText';
import { MinimalistColors } from '../../../utils/colors';
import { CONTENT_WIDTH, ORACLE_FONT_SIZE, ORACLE_HEIGHT, ORACLE_Y } from '../config';

const LOYALTY_COST_REGEX = /^[+−-]?(\d+|X):/; // There is a weird character here! D:
const LOYALTY_ABILITY_OFFSET = 45;
const PLANESWALKER_ORACLE_EXTRA_PADDING = 20;
const PLANESWALKER_ORACLE_BORDER_WIDTH = 16;
const ORACLE_EXTENDED_EXTRA = 40;

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
}) => {
  const x = (ctx.canvas.width - CONTENT_WIDTH) / 2;
  const y = ORACLE_Y;
  const height = ORACLE_HEIGHT + ORACLE_EXTENDED_EXTRA;

  const textPaddingTop = 50;
  const textX = x;
  const textWidth = CONTENT_WIDTH;
  const textY = y + textPaddingTop;
  const textHeight = height - textPaddingTop;

  const paddedX = textX + PLANESWALKER_ORACLE_EXTRA_PADDING;
  const loyaltyAbilityWidth = textWidth - PLANESWALKER_ORACLE_EXTRA_PADDING - LOYALTY_ABILITY_OFFSET;
  const regularOracleWidth = textWidth - PLANESWALKER_ORACLE_EXTRA_PADDING - PLANESWALKER_ORACLE_BORDER_WIDTH * 1.5;

  drawPlaneswalkerOracleBorder(ctx, { cardColorIdentity, x: textX, y: textY - 50, height: textHeight + 60, width: textWidth });

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
