import { drawRoundedBox } from '../../../utils/canvasShapes';
import { getColorIdentityStyle } from '../../../utils/canvasStyles';
import { PINLINE_THICKNESS, STATSLINE_FONT_SIZE, STATSLINE_HEIGHT, STATSLINE_Y } from '../config';

const STATS_X = 385;
const STATS_WIDTH = 88;

export const drawStatsBox = (ctx, { cardPower, cardToughness, cardColorIdentity }) => {
  const x = STATS_X;
  const y = STATSLINE_Y;
  const width = STATS_WIDTH;
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
    lineWidth: 2,
    strokeStyle: 'black',
    fillStyle: 'white',
  });

  ctx.font = `${STATSLINE_FONT_SIZE}px Serif`;
  ctx.fillStyle = 'black';
  ctx.textAlign = 'center';
  ctx.fillText(`${cardPower}/${cardToughness}`, x + width / 2, y + height / 2 + 10);
};
