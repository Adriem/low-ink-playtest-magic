import { drawRectangle } from '../../common/canvasShapes';
import { fitFontSizeInXY } from '../../common/canvasText';
import { fillMultilineText } from '../../common/oracleTextRenderer';
import { CONTENT_WIDTH, PINLINE_THICKNESS, SUBCARD_ORACLE_FONT_SIZE, SUBCARD_ORACLE_HEIGHT, SUBCARD_ORACLE_Y, TEXT_FONT_FAMILY } from '../config';
import type { SubCardPosition } from '../../../../domain/cards';
import { MINIMALIST_PALETTE } from '../palette';
import { getPaletteColors, type ColorTreatment } from '../../../../domain/colorTreatment';
import { getFillStyle } from '../../common/canvasStyles';

const TEXT_PADDING_FROM_CENTER = 15;
const TEXT_PADDING_FROM_OUTSIDE = 10;

const drawOracleBorder = (ctx: CanvasRenderingContext2D, { cardColorTreatment, position, y }: { cardColorTreatment: ColorTreatment, position: SubCardPosition, y: number }) => {
  const x = position === 'right'
    ? ctx.canvas.width / 2 + PINLINE_THICKNESS / 2
    : (ctx.canvas.width - CONTENT_WIDTH) / 2;
  const width = CONTENT_WIDTH / 2 - PINLINE_THICKNESS / 2;

  drawRectangle(ctx, {
    x,
    y,
    width,
    height: PINLINE_THICKNESS,
    fillStyle: getFillStyle(ctx, getPaletteColors(cardColorTreatment, MINIMALIST_PALETTE)),
  });
};

export const drawSubCardOracleBox = (ctx: CanvasRenderingContext2D, {
  cardOracleText,
  cardColorTreatment,
  position,
}: { cardOracleText?: string, cardColorTreatment: ColorTreatment, position: SubCardPosition }) => {
  const cardWidth = ctx.canvas.width;
  const textMarginX = (cardWidth - CONTENT_WIDTH) / 2;

  const textX = position === 'left'
    ? textMarginX + TEXT_PADDING_FROM_OUTSIDE
    : ctx.canvas.width / 2 + PINLINE_THICKNESS / 2 + TEXT_PADDING_FROM_CENTER;
  const textWidth = CONTENT_WIDTH / 2 - PINLINE_THICKNESS / 2 - TEXT_PADDING_FROM_CENTER - TEXT_PADDING_FROM_OUTSIDE;

  drawOracleBorder(ctx, {
    cardColorTreatment,
    position,
    y: SUBCARD_ORACLE_Y + SUBCARD_ORACLE_HEIGHT
  });

  ctx.font = `${SUBCARD_ORACLE_FONT_SIZE}px ${TEXT_FONT_FAMILY}`;
  ctx.fillStyle = MINIMALIST_PALETTE.TEXT;
  ctx.textAlign = 'start';

  fillMultilineText(ctx, fitFontSizeInXY(
    ctx,
    (cardOracleText ?? '').split('\n'),
    textWidth,
    SUBCARD_ORACLE_HEIGHT,
  ), textX, SUBCARD_ORACLE_Y);
};
