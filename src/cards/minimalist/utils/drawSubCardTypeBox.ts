import { SUBCARD_TYPELINE_FONT_SIZE, SUBCARD_TYPELINE_HEIGHT, SUBCARD_TYPELINE_Y, TYPELINE_WIDTH } from '../config';
import { drawTypeLine } from './drawTypeLine';
import type { ColorIdentity } from '../../../utils/colors';
import type { SubCardPosition } from '../../styles';

export const drawSubCardTypeBox = (ctx: CanvasRenderingContext2D, { cardType, cardColorIdentity, position }: { cardType?: string, cardColorIdentity?: ColorIdentity, position: SubCardPosition }) => {
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
