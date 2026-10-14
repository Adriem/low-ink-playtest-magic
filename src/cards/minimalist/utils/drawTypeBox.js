import { TYPELINE_FONT_SIZE, TYPELINE_HEIGHT, TYPELINE_WIDTH, TYPELINE_Y } from '../config';
import { drawTypeLine } from './drawTypeLine';

export const drawTypeBox = (ctx, { cardType, cardColorIdentity }) => {
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
