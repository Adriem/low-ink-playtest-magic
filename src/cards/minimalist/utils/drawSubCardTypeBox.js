import { SUBCARD_TYPELINE_FONT_SIZE, SUBCARD_TYPELINE_HEIGHT, SUBCARD_TYPELINE_Y, TYPELINE_WIDTH } from '../config';
import { drawTypeLine } from './drawTypeLine';

export const drawSubCardTypeBox = (ctx, { cardType, cardColorIdentity, position }) => {
  const cardWidth = ctx.canvas.width;
  const typeBoxMarginX = (cardWidth - TYPELINE_WIDTH) / 2;

  drawTypeLine(ctx, {
    cardType,
    cardColorIdentity,
    x: position === 'left' ? typeBoxMarginX : cardWidth / 2,
    y: SUBCARD_TYPELINE_Y,
    width: TYPELINE_WIDTH / 2,
    height: SUBCARD_TYPELINE_HEIGHT,
    fontSize: SUBCARD_TYPELINE_FONT_SIZE,
    flatSide: position === 'left' ? 'right' : 'left',
  });
};
