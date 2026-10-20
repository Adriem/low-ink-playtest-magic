import { TYPELINE_FONT_SIZE, TYPELINE_HEIGHT, TYPELINE_WIDTH, TYPELINE_Y } from '../config';
import { drawTypeLine } from './drawTypeLine';
import type { CardColorTreatment } from '../../../../domain/colorTreatment';
import type { InkLevel } from '../../styles';

export const drawTypeBox = (
  ctx: CanvasRenderingContext2D,
  {
    cardType,
    cardColorTreatment,
    inkLevel,
  }: { cardType?: string; cardColorTreatment: CardColorTreatment; inkLevel?: InkLevel },
) => {
  drawTypeLine(ctx, {
    cardType,
    cardColorTreatment,
    inkLevel,
    x: (ctx.canvas.width - TYPELINE_WIDTH) / 2,
    y: TYPELINE_Y,
    width: TYPELINE_WIDTH,
    height: TYPELINE_HEIGHT,
    fontSize: TYPELINE_FONT_SIZE,
  });
};
