import { drawRectangle } from '../../../utils/canvasShapes';
import { getColorIdentityStyle } from '../../../utils/canvasStyles';
import { fillMultilineText, fitFontSizeInXY } from '../../../utils/canvasText';
import { CONTENT_WIDTH, FONT_FAMILY, ORACLE_FONT_SIZE, ORACLE_HEIGHT, ORACLE_TEXT_PADDING_X, ORACLE_TEXT_PADDING_Y, ORACLE_TEXT_STATS_CLEARANCE, ORACLE_Y, PINLINE_THICKNESS } from '../config';
import { InkColors } from '../../../utils/colors';

export const drawOracleBox = (ctx, {
  cardOracleText,
  cardPower,
  cardToughness,
  cardColorIdentity,
  layout,
}) => {
  const x = layout === 'right-half' ? ctx.canvas.width / 2 : (ctx.canvas.width - CONTENT_WIDTH) / 2;
  const y = ORACLE_Y;
  const width = layout === 'full-width' ? CONTENT_WIDTH : CONTENT_WIDTH / 2;
  const height = ORACLE_HEIGHT;

  drawRectangle(ctx, {
    x,
    y,
    width,
    height,
    lineWidth: 0,
    fillStyle: getColorIdentityStyle(ctx, cardColorIdentity),
  });

  drawRectangle(ctx, {
    x: x + PINLINE_THICKNESS,
    y: y + PINLINE_THICKNESS,
    width: width - PINLINE_THICKNESS * 2,
    height: height - PINLINE_THICKNESS * 2,
    lineWidth: PINLINE_THICKNESS,
    strokeStyle: InkColors.LINE,
    fillStyle: InkColors.PAPER,
  });

  const textPaddingX = ORACLE_TEXT_PADDING_X;
  const textX = x + PINLINE_THICKNESS + textPaddingX;
  const textWidth = width - PINLINE_THICKNESS * 2 - textPaddingX * 2;

  const textPaddingTop = ORACLE_FONT_SIZE + ORACLE_TEXT_PADDING_Y;
  const textPaddingBottom = (cardPower != null && cardToughness != null) && layout !== 'left-half' ? ORACLE_TEXT_STATS_CLEARANCE : ORACLE_TEXT_PADDING_Y;
  const textY = y + PINLINE_THICKNESS + textPaddingTop;
  const textHeight = height - PINLINE_THICKNESS * 2 - textPaddingTop - textPaddingBottom;

  ctx.font = `${ORACLE_FONT_SIZE}px ${FONT_FAMILY}`;
  ctx.fillStyle = InkColors.TEXT;
  ctx.textAlign = 'start';

  fillMultilineText(ctx, fitFontSizeInXY(
    ctx,
    cardOracleText.split('\n'),
    textWidth,
    textHeight,
  ), textX, textY);
};
