import { TYPELINE_FONT_SIZE, TYPELINE_HEIGHT, TYPELINE_WIDTH, TYPELINE_Y } from '../config';
import { drawTypeLine } from './drawTypeLine';
import type { ColorTreatment } from '../../../../domain/colorTreatment';

export const drawTypeBox = (ctx: CanvasRenderingContext2D, { cardType, cardColorTreatment }: { cardType?: string, cardColorTreatment: ColorTreatment }) => {
  drawTypeLine(ctx, {
    cardType,
    cardColorTreatment,
    x: (ctx.canvas.width - TYPELINE_WIDTH) / 2,
    y: TYPELINE_Y,
    width: TYPELINE_WIDTH,
    height: TYPELINE_HEIGHT,
    fontSize: TYPELINE_FONT_SIZE,
  });
};
