import type { MinimalistPalette } from '../palette';
import { DISPLAY_FONT_FAMILY, STATSLINE_FONT_SIZE, STATSLINE_X, STATSLINE_Y } from '../config';

export const drawStatsBox = (
  ctx: CanvasRenderingContext2D,
  { palette, cardPower, cardToughness }: { palette: MinimalistPalette; cardPower: string; cardToughness: string },
) => {
  ctx.font = `${STATSLINE_FONT_SIZE}px ${DISPLAY_FONT_FAMILY}`;
  ctx.fillStyle = palette.TEXT;
  ctx.textAlign = 'center';
  ctx.fillText(`${cardPower}/${cardToughness}`, STATSLINE_X, STATSLINE_Y);
};
