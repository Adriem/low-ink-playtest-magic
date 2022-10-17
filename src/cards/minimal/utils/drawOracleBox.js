import { drawLoyaltyMinus, drawLoyaltyPlus, drawLoyaltyZero } from '../../../utils/canvasShapes';
import { getColorIdentityStyle } from '../../../utils/canvasStyles';
import { fillMultilineText, fitFontSizeInX, fitTextIntoBox } from '../../../utils/canvasText';
import { MinimalistColors } from '../../../utils/colors';

const LOYALTY_COST_REGEX = /^[+−-]?(\d+|X):/; // There is a weird character here! D:
const LOYALTY_ABILITY_OFFSET = 45;
const PLANESWALKER_ORACLE_EXTRA_PADDING = 20;
const PLANESWALKER_ORACLE_BORDER_WIDTH = 16;

export const drawOracleBox = (ctx, { cardOracleText, x, y, height, width }) => {
  ctx.font = "30px Verdana";
  ctx.fillStyle = 'black';
  ctx.textAlign = 'start';

  const paragraphs = fitTextIntoBox(
    ctx,
    cardOracleText.split('\n').map(content => ({ content, width })),
    height,
  );

  let currentY = y
  for (const paragraph of paragraphs) {
    fillMultilineText(ctx, paragraph.lines, x, currentY)
    currentY += paragraph.paragraphHeight
  }
};

const drawPlaneswalkerOracleBorder = (ctx, { cardColorIdentity, x, y, height, width }) => {
  ctx.fillStyle = getColorIdentityStyle(ctx, cardColorIdentity, { palettte: MinimalistColors });

  const xOffsetL = x + PLANESWALKER_ORACLE_EXTRA_PADDING - PLANESWALKER_ORACLE_BORDER_WIDTH * .65
  const xOffsetR = x + PLANESWALKER_ORACLE_EXTRA_PADDING + PLANESWALKER_ORACLE_BORDER_WIDTH * .35

  ctx.beginPath();
  ctx.moveTo(xOffsetL - 15, y);
  ctx.ellipse(xOffsetL - 15, y + 20, 15, 20, 0, 1.5 * Math.PI, 0);
  ctx.ellipse(xOffsetL + 100, y + height - 60, 100, 60, 0, Math.PI, 0.5 * Math.PI, true);
  ctx.ellipse(xOffsetR + 100, y + height - 60, 100, 60, 0, 0.5 * Math.PI, Math.PI);
  ctx.ellipse(xOffsetR + 35, y + 25, 35, 25, 0, Math.PI, 1.5 * Math.PI, false);
  ctx.closePath();

  ctx.fill();
}

export const drawPlaneswalkerOracleBox = (ctx, { cardOracleText, cardColorIdentity, x, y, height, width }) => {
  const paddedX = x + PLANESWALKER_ORACLE_EXTRA_PADDING;
  const loyaltyAbilityWidth = width - PLANESWALKER_ORACLE_EXTRA_PADDING - LOYALTY_ABILITY_OFFSET;
  const regularOracleWidth = width - PLANESWALKER_ORACLE_EXTRA_PADDING - PLANESWALKER_ORACLE_BORDER_WIDTH * 1.5;

  drawPlaneswalkerOracleBorder(ctx, { cardColorIdentity, x, y: y - 50, height: height + 75, width })

  ctx.font = "30px Tahoma";
  ctx.fillStyle = 'black';
  ctx.textAlign = 'start';

  const originalParagraphs = cardOracleText.split('\n');

  const paragraphs = fitTextIntoBox(
    ctx,
    originalParagraphs.map(content => {
      const isLoyaltyAbility = LOYALTY_COST_REGEX.test(content)

      return {
        content: isLoyaltyAbility ? content.replace(LOYALTY_COST_REGEX, '').trim() : content,
        width: isLoyaltyAbility ? loyaltyAbilityWidth : regularOracleWidth,
      }
    }),
    height,
  );

  let currentY = y
  for (const [index, paragraph] of paragraphs.entries()) {
    const originalParagraph = originalParagraphs[index]
    const isLoyaltyAbility = LOYALTY_COST_REGEX.test(originalParagraph)

    if (isLoyaltyAbility) {
      fillMultilineText(ctx, paragraph.lines, paddedX + LOYALTY_ABILITY_OFFSET, currentY)
    } else {
      fillMultilineText(ctx, paragraph.lines, paddedX + PLANESWALKER_ORACLE_BORDER_WIDTH * 1.5, currentY)
    }

    currentY += paragraph.paragraphHeight
  }

  // Drawing the loyalty symbols will mess up the configuration for writing the
  // oracle text in the canvas, so it must be done after all the text is rendered
  currentY = y
  for (const [index, paragraph] of paragraphs.entries()) {
    const originalParagraph = originalParagraphs[index]
    const isLoyaltyAbility = LOYALTY_COST_REGEX.test(originalParagraph)

    if (isLoyaltyAbility) {
      const [abilityCost] = originalParagraph.match(LOYALTY_COST_REGEX)
      const parsedAbilityCost = abilityCost.replace(':', '');

      const drawLoyaltyCost = parsedAbilityCost.startsWith('+')
        ? drawLoyaltyPlus
        : parsedAbilityCost === '0'
          ? drawLoyaltyZero
          : drawLoyaltyMinus

        drawLoyaltyCost(ctx, {
          loyaltyCost: parsedAbilityCost,
          x: paddedX,
          y: currentY + (paragraph.lineHeight * (paragraph.lines.length - 1) / 2),
          scale: 1.1,
          fontFamily: 'Tahoma',
        })
    }

    currentY += paragraph.paragraphHeight
  }
};
