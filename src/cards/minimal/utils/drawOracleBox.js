import {
  drawLoyaltyMinus,
  drawLoyaltyPlus,
  drawLoyaltyZero,
  drawRectangle,
} from '../../../utils/canvasShapes';
import { getColorIdentityStyle } from '../../../utils/canvasStyles';
import { fillMultilineText, fitFontSizeInX, fitTextIntoBox } from '../../../utils/canvasText';
import { MinimalistColors } from '../../../utils/colors';

const LOYALTY_COST_REGEX = /^[+−-]?(\d+|X):/; // There is a weird character here! D:
const LOYALTY_ABILITY_OFFSET = 45;
const PLANESWALKER_ORACLE_EXTRA_PADDING = 20;
const PLANESWALKER_ORACLE_BORDER_WIDTH = 16;
const TYPE_BOX_BOTTOM_Y = 220;
const DIVIDER_THICKNESS = 5;

const resolveSubCardLayout = (ctx, { x, y, height, width, subCardPosition }) => {
  if (!subCardPosition) return { x, width };

  const halfWidth = (width - DIVIDER_THICKNESS) / 2;
  const contentX = subCardPosition === 'left' ? x + halfWidth + DIVIDER_THICKNESS : x;

  return { x: contentX, width: halfWidth };
};

const drawSubCardDivider = (ctx, { cardColorIdentity, x, y, height, width }) => {
  const dividerX = x + (width - DIVIDER_THICKNESS) / 2;
  drawRectangle(ctx, {
    x: dividerX,
    y: TYPE_BOX_BOTTOM_Y,
    width: DIVIDER_THICKNESS,
    height: y + height - TYPE_BOX_BOTTOM_Y,
    fillStyle: getColorIdentityStyle(ctx, cardColorIdentity),
  });
};

const applyFlatSide = (ctx, { x, width, flatSide }) => {
  if (flatSide === 'left') return { x: 0, width: x + width };
  if (flatSide === 'right') return { x, width: ctx.canvas.width - x };
  return { x, width };
};

export const drawOracleBox = (ctx, { cardOracleText, cardColorIdentity, x, y, height, width, subCardPosition, flatSide }) => {
  const { x: flatX, width: flatWidth } = applyFlatSide(ctx, { x, width, flatSide });
  const { x: contentX, width: contentWidth } = resolveSubCardLayout(ctx, { x: flatX, y, height, width: flatWidth, subCardPosition });

  ctx.font = "30px Verdana";
  ctx.fillStyle = 'black';
  ctx.textAlign = 'start';

  const paragraphs = fitTextIntoBox(
    ctx,
    (cardOracleText ?? '').split('\n').map(content => ({ content, width: contentWidth })),
    height,
  );

  let currentY = y
  for (const paragraph of paragraphs) {
    fillMultilineText(ctx, paragraph.lines, contentX, currentY)
    currentY += paragraph.paragraphHeight
  }

  drawRectangle(ctx, {
    x: flatX,
    y: y + height,
    width: flatWidth,
    height: 5,
    fillStyle: getColorIdentityStyle(ctx, cardColorIdentity)
  })

  if (subCardPosition) {
    drawSubCardDivider(ctx, { cardColorIdentity, x: flatX, y, height, width: flatWidth });
  }
};

const drawPlaneswalkerOracleBorder = (ctx, { cardColorIdentity, x, y, height }) => {
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

export const drawPlaneswalkerOracleBox = (ctx, { cardOracleText, cardColorIdentity, x, y, height, width, subCardPosition, flatSide }) => {
  const { x: flatX, width: flatWidth } = applyFlatSide(ctx, { x, width, flatSide });
  const { x: contentX, width: contentWidth } = resolveSubCardLayout(ctx, { x: flatX, y, height, width: flatWidth, subCardPosition });
  const paddedX = contentX + PLANESWALKER_ORACLE_EXTRA_PADDING;
  const loyaltyAbilityWidth = contentWidth - PLANESWALKER_ORACLE_EXTRA_PADDING - LOYALTY_ABILITY_OFFSET;
  const regularOracleWidth = contentWidth - PLANESWALKER_ORACLE_EXTRA_PADDING - PLANESWALKER_ORACLE_BORDER_WIDTH * 1.5;

  drawPlaneswalkerOracleBorder(ctx, { cardColorIdentity, x: contentX, y: y - 50, height: height + 60, width: contentWidth })

  if (subCardPosition) {
    drawSubCardDivider(ctx, { cardColorIdentity, x: flatX, y, height, width: flatWidth });
  }

  ctx.font = "30px Tahoma";
  ctx.fillStyle = 'black';
  ctx.textAlign = 'start';

  const originalParagraphs = (cardOracleText ?? '').split('\n');

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
