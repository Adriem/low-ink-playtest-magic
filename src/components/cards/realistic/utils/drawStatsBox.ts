import {
  FONT_FAMILY,
  STATSLINE_FONT_SIZE,
  STATSLINE_HEIGHT,
  STATSLINE_WIDTH,
  STATSLINE_Y,
  TITLE_WIDTH,
} from '../config';
import { drawFramedBox } from './drawFramedBox';
import { REALISTIC_PALETTE } from '../palette';
import type { CardColorTreatment } from '../../../../domain/colorTreatment';
import type { InkLevel } from '../../styles';

export const drawStatsBox = (
  ctx: CanvasRenderingContext2D,
  {
    cardPower,
    cardToughness,
    cardColorTreatment,
    inkLevel,
  }: { cardPower: string; cardToughness: string; cardColorTreatment: CardColorTreatment; inkLevel?: InkLevel },
) => {
  const x = (ctx.canvas.width - TITLE_WIDTH) / 2 + TITLE_WIDTH - STATSLINE_WIDTH;
  const y = STATSLINE_Y;
  const width = STATSLINE_WIDTH;
  const height = STATSLINE_HEIGHT;

  drawFramedBox(ctx, {
    x,
    y,
    width,
    height,
    cardColorTreatment,
    inkLevel,
    inkFillStrength: 'light',
    shape: 'capsule',
    innerHeightAdjustment: -2,
  });

  ctx.font = `${STATSLINE_FONT_SIZE}px ${FONT_FAMILY}`;
  ctx.fillStyle = REALISTIC_PALETTE.TEXT;
  ctx.textAlign = 'center';
  ctx.fillText(`${cardPower}/${cardToughness}`, x + width / 2, y + height / 2 + 10);
};
