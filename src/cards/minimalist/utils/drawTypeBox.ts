import { TYPELINE_FONT_SIZE, TYPELINE_HEIGHT, TYPELINE_WIDTH, TYPELINE_Y } from '../config';
import { drawTypeLine } from './drawTypeLine';
import type { ColorIdentity } from '../../../utils/colors';

export const drawTypeBox = (ctx: CanvasRenderingContext2D, { cardType, cardColorIdentity }: { cardType?: string, cardColorIdentity?: ColorIdentity }) => {
  drawTypeLine(ctx, {
    cardType,
    cardColorIdentity,
    x: (ctx.canvas.width - TYPELINE_WIDTH) / 2,
    y: TYPELINE_Y,
    width: TYPELINE_WIDTH,
    height: TYPELINE_HEIGHT,
    fontSize: TYPELINE_FONT_SIZE,
  });
};
