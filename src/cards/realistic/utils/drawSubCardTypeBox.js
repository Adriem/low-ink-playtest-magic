import { drawRoundedBox } from '../../../utils/canvasShapes';
import { getColorIdentityStyle } from '../../../utils/canvasStyles';
import { fitFontSizeInX } from '../../../utils/canvasText';
import { CAPSULE_INNER_STROKE, PINLINE_THICKNESS, SUBCARD_TYPELINE_FONT_SIZE, SUBCARD_TYPELINE_HEIGHT, SUBCARD_TYPELINE_Y, TITLE_WIDTH } from '../config';

export const drawSubCardTypeBox = (ctx, {
  cardType,
  cardColorIdentity,
  position,
}) => {
  const x = position === 'left' ? (ctx.canvas.width - TITLE_WIDTH) / 2 : ctx.canvas.width / 2;
  const y = SUBCARD_TYPELINE_Y;
  const width = TITLE_WIDTH / 2;
  const height = SUBCARD_TYPELINE_HEIGHT;
  const flatSide = position === 'left' ? 'right' : 'left';

  const innerLeftPad = flatSide === 'left' ? 0 : PINLINE_THICKNESS;
  const innerRightPad = flatSide === 'right' ? 0 : PINLINE_THICKNESS;
  const innerX = x + innerLeftPad;
  const innerWidth = width - innerLeftPad - innerRightPad;
  const innerY = y + PINLINE_THICKNESS;
  const innerHeight = height - PINLINE_THICKNESS * 2;

  drawRoundedBox(ctx, {
    x,
    y,
    width,
    height,
    lineWidth: 0,
    fillStyle: getColorIdentityStyle(ctx, cardColorIdentity),
    flatSide,
  });
  drawRoundedBox(ctx, {
    x: innerX,
    y: innerY,
    width: innerWidth,
    height: innerHeight,
    lineWidth: CAPSULE_INNER_STROKE,
    strokeStyle: 'black',
    fillStyle: 'white',
    flatSide,
  });

  const textX = flatSide === 'left' ? x + PINLINE_THICKNESS : x + PINLINE_THICKNESS * 2 + 7;
  const textRight = flatSide === 'right' ? x + width - PINLINE_THICKNESS : x + width - PINLINE_THICKNESS * 2 - 7;
  const innerCenterY = y + height / 2;

  ctx.font = `bold ${SUBCARD_TYPELINE_FONT_SIZE}px Serif`;
  ctx.fillStyle = 'black';
  ctx.textAlign = 'start';
  fitFontSizeInX(ctx, cardType, textRight - textX);
  ctx.fillText(cardType, textX, innerCenterY + SUBCARD_TYPELINE_FONT_SIZE / 3);
};
