import type { Palette } from '../../../../domain/colorTreatment';
import { drawLoyaltyBox } from '../../common/canvasShapes';
import { fillMultilineText, fitOracleLines } from '../../common/oracleTextRenderer';
import {
  CONTENT_WIDTH,
  FONT_FAMILY,
  LOYALTY_BOX_X,
  LOYALTY_BOX_Y,
  ORACLE_FONT_SIZE,
  ORACLE_HEIGHT,
  ORACLE_TEXT_PADDING_X,
  ORACLE_TEXT_PADDING_Y,
  ORACLE_TEXT_STATS_CLEARANCE,
  ORACLE_Y,
  PINLINE_THICKNESS,
} from '../config';
import { drawFramedBox } from './drawFramedBox';
import type { InkLevel, OracleLayout } from '../../styles';
import type { CardColorTreatment } from '../../../../domain/colorTreatment';
import type { OracleText } from '../../../../domain/oracleText';

// TODO: Change the way planeswalker oracle boxes are rendered. For now they're
// drawn like the regular oracle box (plain rules text) plus the loyalty box.
/**
 * Draw the oracle text box of a planeswalker, with its loyalty box overlapping
 * the bottom of it.
 */
export const drawPlaneswalkerOracleBox = (
  ctx: CanvasRenderingContext2D,
  {
    palette,
    cardOracleText = { lines: [] },
    cardLoyalty,
    cardColorTreatment,
    inkLevel,
    layout,
  }: {
    palette: Palette;
    cardOracleText?: OracleText;
    cardLoyalty: string;
    cardColorTreatment: CardColorTreatment;
    inkLevel?: InkLevel;
    layout: OracleLayout;
  },
) => {
  const x = layout === 'right-half' ? ctx.canvas.width / 2 : (ctx.canvas.width - CONTENT_WIDTH) / 2;
  const y = ORACLE_Y;
  const width = layout === 'full-width' ? CONTENT_WIDTH : CONTENT_WIDTH / 2;
  const height = ORACLE_HEIGHT;

  drawFramedBox(ctx, {
    palette,
    x,
    y,
    width,
    height,
    cardColorTreatment,
    inkLevel,
    inkFillStrength: 'light',
    shape: 'rectangle',
  });

  const textPaddingX = ORACLE_TEXT_PADDING_X;
  const textX = x + PINLINE_THICKNESS + textPaddingX;
  const textWidth = width - PINLINE_THICKNESS * 2 - textPaddingX * 2;

  const textPaddingTop = ORACLE_FONT_SIZE + ORACLE_TEXT_PADDING_Y;
  const textPaddingBottom = layout !== 'left-half' ? ORACLE_TEXT_STATS_CLEARANCE : ORACLE_TEXT_PADDING_Y;
  const textY = y + PINLINE_THICKNESS + textPaddingTop;
  const textHeight = height - PINLINE_THICKNESS * 2 - textPaddingTop - textPaddingBottom;

  ctx.font = `${ORACLE_FONT_SIZE}px ${FONT_FAMILY}`;
  ctx.fillStyle = palette.TEXT;
  ctx.textAlign = 'start';

  fillMultilineText(
    ctx,
    fitOracleLines(ctx, cardOracleText.lines, textWidth, textHeight, { inlineLoyaltyCost: true }),
    textX,
    textY,
  );

  drawLoyaltyBox(ctx, {
    cardLoyalty,
    x: LOYALTY_BOX_X,
    y: LOYALTY_BOX_Y,
    fontFamily: FONT_FAMILY,
    colors: palette,
  });
};
