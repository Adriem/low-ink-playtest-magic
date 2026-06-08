import { drawRoundedBox } from '../../../utils/canvasShapes';
import { getColorIdentityStyle } from '../../../utils/canvasStyles';
import { fitFontSizeInX } from '../../../utils/canvasText';
import { CAPSULE_INNER_STROKE, PINLINE_THICKNESS, TITLE_WIDTH, TYPELINE_FONT_SIZE, TYPELINE_HEIGHT, TYPELINE_Y } from '../config';

export const drawTypeBox = (ctx, {
  cardType,
  cardColorIdentity,
}) => {
  const x = (ctx.canvas.width - TITLE_WIDTH) / 2;
  const y = TYPELINE_Y;
  const width = TITLE_WIDTH;
  const height = TYPELINE_HEIGHT;

  drawRoundedBox(ctx, {
    x,
    y,
    width,
    height,
    lineWidth: 0,
    fillStyle: getColorIdentityStyle(ctx, cardColorIdentity),
  });

  drawRoundedBox(ctx, {
    x: x + PINLINE_THICKNESS,
    y: y + PINLINE_THICKNESS,
    width: width - PINLINE_THICKNESS * 2,
    height: height - PINLINE_THICKNESS * 2 - 2,
    lineWidth: CAPSULE_INNER_STROKE,
    strokeStyle: 'black',
    fillStyle: 'white',
  });

  const textX = x + PINLINE_THICKNESS * 2 + 7;
  const textRight = x + width - PINLINE_THICKNESS * 2 - 7;
  const innerCenterY = y + height / 2;

  ctx.font = `bold ${TYPELINE_FONT_SIZE}px Serif`;
  ctx.fillStyle = 'black';
  ctx.textAlign = 'start';
  fitFontSizeInX(ctx, cardType, textRight - textX);
  ctx.fillText(cardType, textX, innerCenterY + 7);
};
