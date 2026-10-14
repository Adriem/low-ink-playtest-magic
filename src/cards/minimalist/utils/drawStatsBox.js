import { DISPLAY_FONT_FAMILY, STATSLINE_FONT_SIZE, STATSLINE_X, STATSLINE_Y } from '../config';
import { InkColors } from '../../../utils/colors';

export const drawStatsBox = (ctx, { cardPower, cardToughness }) => {
  ctx.font = `${STATSLINE_FONT_SIZE}px ${DISPLAY_FONT_FAMILY}`;
  ctx.fillStyle = InkColors.TEXT;
  ctx.textAlign = 'center';
  ctx.fillText(`${cardPower}/${cardToughness}`, STATSLINE_X, STATSLINE_Y);
};
