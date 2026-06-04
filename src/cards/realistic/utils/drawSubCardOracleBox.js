import { drawRectangle } from '../../../utils/canvasShapes';
import { getColorIdentityStyle } from '../../../utils/canvasStyles';
import { fillMultilineText, fitFontSizeInXY } from '../../../utils/canvasText';
import { CONTENT_WIDTH, PINLINE_THICKNESS, SUB_ORACLE_FONT_SIZE, SUB_ORACLE_HEIGHT, SUBCARD_ORACLE_Y } from '../config';

export const drawSubCardOracleBox = (ctx, {
  cardOracleText,
  cardColorIdentity,
  position,
}) => {
  const x = position === 'left' ? (ctx.canvas.width - CONTENT_WIDTH) / 2 : ctx.canvas.width / 2;
  const y = SUBCARD_ORACLE_Y;
  const width = CONTENT_WIDTH / 2;
  const height = SUB_ORACLE_HEIGHT;
  const flatSide = position === 'left' ? 'right' : 'left';

  const innerLeftPad = flatSide === 'left' ? 0 : PINLINE_THICKNESS;
  const innerRightPad = flatSide === 'right' ? 0 : PINLINE_THICKNESS;
  const innerX = x + innerLeftPad;
  const innerWidth = width - innerLeftPad - innerRightPad;
  const innerY = y + PINLINE_THICKNESS;
  const innerHeight = height - PINLINE_THICKNESS * 2;

  drawRectangle(ctx, {
    x,
    y,
    width,
    height,
    lineWidth: 0,
    fillStyle: getColorIdentityStyle(ctx, cardColorIdentity),
  });
  drawRectangle(ctx, {
    x: innerX,
    y: innerY,
    width: innerWidth,
    height: innerHeight,
    lineWidth: PINLINE_THICKNESS,
    strokeStyle: 'black',
    fillStyle: 'white',
  });

  const textPadding = PINLINE_THICKNESS + 4;
  const textX = innerX + textPadding;
  const textRight = innerX + innerWidth - textPadding;
  const textTopY = innerY + 22;
  const textBottomY = innerY + innerHeight - 6;

  ctx.font = `${SUB_ORACLE_FONT_SIZE}px Serif`;
  ctx.fillStyle = 'black';
  ctx.textAlign = 'start';

  fillMultilineText(ctx, fitFontSizeInXY(
    ctx,
    (cardOracleText ?? '').split('\n'),
    textRight - textX,
    textBottomY - textTopY,
  ), textX, textTopY);
};
