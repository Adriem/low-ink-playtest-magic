import { DISPLAY_FONT_FAMILY, STATSLINE_FONT_SIZE, STATSLINE_X, STATSLINE_Y } from '../config';
import { MINIMALIST_PALETTE } from '../palette';

export const drawStatsBox = (ctx: CanvasRenderingContext2D, { cardPower, cardToughness }: { cardPower: string, cardToughness: string }) => {
  ctx.font = `${STATSLINE_FONT_SIZE}px ${DISPLAY_FONT_FAMILY}`;
  ctx.fillStyle = MINIMALIST_PALETTE.TEXT;
  ctx.textAlign = 'center';
  ctx.fillText(`${cardPower}/${cardToughness}`, STATSLINE_X, STATSLINE_Y);
};
