import { drawLoyaltyCost } from '../../common/canvasShapes';
import { fitTextIntoBox } from '../../common/canvasText';
import { fillMultilineText } from '../../common/oracleTextRenderer';
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
import { MINIMALIST_PALETTE } from '../palette';
import { getPaletteColors, type ColorTreatment } from '../../../../domain/colorTreatment';
import { getFillStyle } from '../../common/canvasStyles';

const LOYALTY_COST_REGEX = /^[+−-]?(\d+|X):/; // There is a weird character here! D:
const LOYALTY_ABILITY_OFFSET = 45;

export const drawPlaneswalkerOracleBox = (
  ctx: CanvasRenderingContext2D,
  { cardOracleText, cardColorTreatment }: { cardOracleText?: string; cardColorTreatment: ColorTreatment },
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
  const loyaltyAbilityWidth = textWidth - SIDE_BORDER_PADDING - LOYALTY_ABILITY_OFFSET;
  const regularOracleWidth = textWidth - SIDE_BORDER_PADDING - SIDE_BORDER_WIDTH * 1.5;

  drawPlaneswalkerOracleBorder(ctx, {
    cardColorTreatment,
    x: textX,
    y: textY - textPaddingTop,
    height: textHeight + 60,
  });

  ctx.font = `${ORACLE_FONT_SIZE}px ${DISPLAY_FONT_FAMILY}`;
  ctx.fillStyle = MINIMALIST_PALETTE.TEXT;
  ctx.textAlign = 'start';

  const originalParagraphs = (cardOracleText ?? '').split('\n');

  const paragraphs = fitTextIntoBox(
    ctx,
    originalParagraphs.map((content) => {
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
    const [loyaltyCostLabel] = originalParagraphs[index].match(LOYALTY_COST_REGEX) ?? [];

    if (loyaltyCostLabel) {
      fillMultilineText(ctx, paragraph.lines, paddedX + LOYALTY_ABILITY_OFFSET, currentY);

      // The loyalty cost changes the font and alignment, which the next paragraphs need
      ctx.save();
      drawLoyaltyCost(ctx, {
        loyaltyCost: loyaltyCostLabel.replace(':', ''),
        x: paddedX,
        y: currentY + (paragraph.lineHeight * (paragraph.lines.length - 1)) / 2,
        scale: 1.1,
        fontFamily: DISPLAY_FONT_FAMILY,
        colors: MINIMALIST_PALETTE,
      });
      ctx.restore();
    } else {
      fillMultilineText(ctx, paragraph.lines, paddedX + SIDE_BORDER_WIDTH * 1.5, currentY);
    }

    currentY += paragraph.paragraphHeight;
  }
};

const drawPlaneswalkerOracleBorder = (
  ctx: CanvasRenderingContext2D,
  { cardColorTreatment, x, y, height }: { cardColorTreatment: ColorTreatment; x: number; y: number; height: number },
) => {
  ctx.fillStyle = getFillStyle(ctx, getPaletteColors(cardColorTreatment, MINIMALIST_PALETTE));

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
