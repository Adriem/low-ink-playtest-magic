import { drawLoyaltyMinus, drawLoyaltyPlus, drawLoyaltyZero } from '../../../utils/canvasShapes';
import { fillMultilineText, fitTextIntoBox } from '../../../utils/canvasText';

const LOYALTY_COST_REGEX = /^[+−-]?(\d+|X):/; // There is a weird character here! D:
const LOYALTY_ABILITY_OFFSET = 45;
const PLANESWALKER_ORACLE_EXTRA_PADDING = 20;

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

export const drawPlaneswalkerOracleBox = (ctx, { cardOracleText, x, y, height, width }) => {
  const paddedX = x + PLANESWALKER_ORACLE_EXTRA_PADDING;
  const loyaltyAbilityWidth = width - PLANESWALKER_ORACLE_EXTRA_PADDING - LOYALTY_ABILITY_OFFSET;
  const regularOracleWidth = width - PLANESWALKER_ORACLE_EXTRA_PADDING;

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
      fillMultilineText(ctx, paragraph.lines, paddedX, currentY)
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
          fontFamily: 'Tahoma',
        })
    }

    currentY += paragraph.paragraphHeight
  }
};
