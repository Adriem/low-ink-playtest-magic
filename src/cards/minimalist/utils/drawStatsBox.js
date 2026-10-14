import { STATSLINE_FONT_SIZE, STATSLINE_Y } from '../config';

export const drawStatsBox = (ctx, { cardPower, cardToughness }) => {
  ctx.font = `${STATSLINE_FONT_SIZE}px Tahoma`;
  ctx.fillStyle = 'black';
  ctx.textAlign = 'center';
  ctx.fillText(`${cardPower}/${cardToughness}`, 389 + 40, STATSLINE_Y);
};
