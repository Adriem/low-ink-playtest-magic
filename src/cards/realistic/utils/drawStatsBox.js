import { drawRoundedBox } from '../../../utils/canvasShapes';
import { getColorIdentityStyle } from '../../../utils/canvasStyles';
import { CAPSULE_INNER_STROKE, FONT_FAMILY, PINLINE_THICKNESS, STATSLINE_FONT_SIZE, STATSLINE_HEIGHT, STATSLINE_WIDTH, STATSLINE_Y, TITLE_WIDTH } from '../config';
import { InkColors } from '../../../utils/colors';

export const drawStatsBox = (ctx, { cardPower, cardToughness, cardColorIdentity }) => {
  const x = (ctx.canvas.width - TITLE_WIDTH) / 2 + TITLE_WIDTH - STATSLINE_WIDTH;
  const y = STATSLINE_Y;
  const width = STATSLINE_WIDTH;
  const height = STATSLINE_HEIGHT;

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

  ctx.font = `${STATSLINE_FONT_SIZE}px ${FONT_FAMILY}`;
  ctx.fillStyle = InkColors.TEXT;
  ctx.textAlign = 'center';
  ctx.fillText(`${cardPower}/${cardToughness}`, x + width / 2, y + height / 2 + 10);
};
