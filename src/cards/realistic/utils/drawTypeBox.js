import { drawRoundedBox } from '../../../utils/canvasShapes';
import { getColorIdentityStyle } from '../../../utils/canvasStyles';
import { fitFontSizeInX } from '../../../utils/canvasText';
import { CAPSULE_INNER_STROKE, CAPSULE_TEXT_INSET, FONT_FAMILY, PINLINE_THICKNESS, TITLE_WIDTH, TYPELINE_FONT_SIZE, TYPELINE_HEIGHT, TYPELINE_TEXT_BASELINE_OFFSET, TYPELINE_Y } from '../config';
import { InkColors } from '../../../utils/colors';

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
    strokeStyle: InkColors.LINE,
    fillStyle: InkColors.PAPER,
  });

  const textX = x + PINLINE_THICKNESS * 2 + CAPSULE_TEXT_INSET;
  const textRight = x + width - PINLINE_THICKNESS * 2 - CAPSULE_TEXT_INSET;
  const innerCenterY = y + height / 2;

  ctx.font = `bold ${TYPELINE_FONT_SIZE}px ${FONT_FAMILY}`;
  ctx.fillStyle = InkColors.TEXT;
  ctx.textAlign = 'start';
  fitFontSizeInX(ctx, cardType, textRight - textX);
  ctx.fillText(cardType, textX, innerCenterY + TYPELINE_TEXT_BASELINE_OFFSET);
};
