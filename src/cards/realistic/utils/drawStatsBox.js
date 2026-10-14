import { FONT_FAMILY, STATSLINE_FONT_SIZE, STATSLINE_HEIGHT, STATSLINE_WIDTH, STATSLINE_Y, TITLE_WIDTH } from '../config';
import { InkColors } from '../../../utils/colors';
import { drawFramedBox } from './drawFramedBox';

export const drawStatsBox = (ctx, { cardPower, cardToughness, cardColorIdentity }) => {
  const x = (ctx.canvas.width - TITLE_WIDTH) / 2 + TITLE_WIDTH - STATSLINE_WIDTH;
  const y = STATSLINE_Y;
  const width = STATSLINE_WIDTH;
  const height = STATSLINE_HEIGHT;

  drawFramedBox(ctx, {
    x,
    y,
    width,
    height,
    cardColorIdentity,
    shape: 'capsule',
    innerHeightAdjustment: -2,
  });

  ctx.font = `${STATSLINE_FONT_SIZE}px ${FONT_FAMILY}`;
  ctx.fillStyle = InkColors.TEXT;
  ctx.textAlign = 'center';
  ctx.fillText(`${cardPower}/${cardToughness}`, x + width / 2, y + height / 2 + 10);
};
