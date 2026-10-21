import type { MinimalistPalette } from '../palette';
import {
  drawLoyaltyCost,
  getLoyaltyCostNumberOffset,
  LOYALTY_COST_FONT_SIZE,
  LOYALTY_COST_HALF_WIDTH,
} from '../../common/canvasShapes';
import { fillMultilineText, fitOracleLinesIntoBox } from '../../common/oracleTextRenderer';
import {
  CONTENT_WIDTH,
  DISPLAY_FONT_FAMILY,
  ORACLE_EXTENDED_EXTRA,
  ORACLE_FONT_SIZE,
  ORACLE_HEIGHT,
  ORACLE_TEXT_PADDING_TOP,
  ORACLE_Y,
  SIDE_BORDER_PADDING,
  SIDE_BORDER_WIDTH,
} from '../config';
import { getSideBorderEdges } from './sideBorder';
import { getPaletteColors, type CardColorTreatment } from '../../../../domain/colorTreatment';
import { getFillStyle } from '../../common/canvasStyles';
import { isLoyaltyAbility, type OracleText } from '../../../../domain/oracleText';

/** How big the loyalty cost icons are, relative to their default size */
const LOYALTY_COST_SCALE = 1.1;
/** Space around the colon after a loyalty cost */
const LOYALTY_COLON_GAP = 3;
/** How far below the colon's baseline the numbers of loyalty costs go: where minus costs have them */
const MINUS_COST_NUMBER_OFFSET = getLoyaltyCostNumberOffset('−1', LOYALTY_COST_SCALE);
/** How much higher plus costs go than that, as their icon's arrow points up */
const PLUS_COST_RAISE = 2;

export const drawPlaneswalkerOracleBox = (
  ctx: CanvasRenderingContext2D,
  {
    palette,
    cardOracleText,
    cardColorTreatment,
  }: { palette: MinimalistPalette; cardOracleText?: OracleText; cardColorTreatment: CardColorTreatment },
) => {
  const x = (ctx.canvas.width - CONTENT_WIDTH) / 2;
  const y = ORACLE_Y;
  const height = ORACLE_HEIGHT + ORACLE_EXTENDED_EXTRA;

  const textPaddingTop = ORACLE_TEXT_PADDING_TOP;
  const textX = x;
  const textWidth = CONTENT_WIDTH;
  const textY = y + textPaddingTop;
  const textHeight = height - textPaddingTop;

  const paddedX = textX + SIDE_BORDER_PADDING;
  const regularOracleWidth = textWidth - SIDE_BORDER_PADDING - SIDE_BORDER_WIDTH * 1.5;

  // Loyalty costs are followed by a colon as big as their numbers, and then their ability
  const colonFont = `${LOYALTY_COST_FONT_SIZE * LOYALTY_COST_SCALE}px ${DISPLAY_FONT_FAMILY}`;
  ctx.font = colonFont;
  const colonX = paddedX + LOYALTY_COST_HALF_WIDTH * LOYALTY_COST_SCALE + LOYALTY_COLON_GAP;
  const abilityX = colonX + ctx.measureText(':').width + LOYALTY_COLON_GAP * 2;
  const loyaltyAbilityWidth = textX + textWidth - abilityX;

  drawPlaneswalkerOracleBorder(ctx, {
    palette,
    cardColorTreatment,
    x: textX,
    y: textY - textPaddingTop,
    height: textHeight + 60,
  });

  ctx.font = `${ORACLE_FONT_SIZE}px ${DISPLAY_FONT_FAMILY}`;
  ctx.fillStyle = palette.TEXT;
  ctx.textAlign = 'start';

  // Loyalty abilities, and their modes, go after the loyalty costs
  const paragraphs = fitOracleLinesIntoBox(
    ctx,
    cardOracleText?.lines ?? [],
    (line) => (isLoyaltyAbility(line) ? loyaltyAbilityWidth : regularOracleWidth),
    textHeight,
  );

  let currentY = textY;
  for (const paragraph of paragraphs) {
    const isAbility = isLoyaltyAbility(paragraph.line);
    const loyaltyCost = isLoyaltyAbility(paragraph.line) && !paragraph.isMode ? paragraph.line.loyaltyCost : undefined;

    if (isAbility) {
      fillMultilineText(ctx, paragraph.lines, abilityX, currentY);
    }

    if (loyaltyCost) {
      const middleY = currentY + (paragraph.lineHeight * (paragraph.lines.length - 1)) / 2;
      // The loyalty cost and its colon change the font and alignment, which the next paragraphs need
      ctx.save();
      drawLoyaltyCost(ctx, {
        loyaltyCost,
        x: paddedX,
        // Every cost's number goes where minus costs have it, a bit below the colon's baseline
        y:
          middleY +
          MINUS_COST_NUMBER_OFFSET -
          getLoyaltyCostNumberOffset(loyaltyCost, LOYALTY_COST_SCALE) -
          (loyaltyCost.startsWith('+') ? PLUS_COST_RAISE : 0),
        scale: LOYALTY_COST_SCALE,
        fontFamily: DISPLAY_FONT_FAMILY,
        colors: palette,
      });
      ctx.font = colonFont;
      ctx.fillStyle = palette.TEXT;
      ctx.textAlign = 'start';
      ctx.fillText(':', colonX, middleY);
      ctx.restore();
    }

    if (!isAbility) {
      fillMultilineText(ctx, paragraph.lines, paddedX + SIDE_BORDER_WIDTH * 1.5, currentY);
    }

    currentY += paragraph.paragraphHeight;
  }
};

const drawPlaneswalkerOracleBorder = (
  ctx: CanvasRenderingContext2D,
  {
    palette,
    cardColorTreatment,
    x,
    y,
    height,
  }: { palette: MinimalistPalette; cardColorTreatment: CardColorTreatment; x: number; y: number; height: number },
) => {
  ctx.fillStyle = getFillStyle(ctx, getPaletteColors(cardColorTreatment.pinlineColors, palette));

  const { left: xOffsetL, right: xOffsetR } = getSideBorderEdges(x);

  ctx.beginPath();
  ctx.moveTo(xOffsetL - 15, y);
  ctx.ellipse(xOffsetL - 15, y + 20, 15, 20, 0, 1.5 * Math.PI, 0);
  ctx.ellipse(xOffsetL + 100, y + height - 60, 100, 60, 0, Math.PI, 0.5 * Math.PI, true);
  ctx.ellipse(xOffsetR + 100, y + height - 60, 100, 60, 0, 0.5 * Math.PI, Math.PI);
  ctx.ellipse(xOffsetR + 35, y + 25, 35, 25, 0, Math.PI, 1.5 * Math.PI, false);
  ctx.closePath();

  ctx.fill();
};
