import { SUBCARD_TYPELINE_FONT_SIZE, SUBCARD_TYPELINE_HEIGHT, SUBCARD_TYPELINE_Y, TYPELINE_WIDTH } from '../config';
import { drawTypeLine } from './drawTypeLine';
import type { CardColorTreatment } from '../../../../domain/colorTreatment';
import type { SubCardPosition } from '../../../../domain/cards';
import type { InkLevel } from '../../styles';

export const drawSubCardTypeBox = (
  ctx: CanvasRenderingContext2D,
  {
    cardType,
    cardColorTreatment,
    inkLevel,
    position,
  }: { cardType?: string; cardColorTreatment: CardColorTreatment; inkLevel?: InkLevel; position: SubCardPosition },
) => {
  const cardWidth = ctx.canvas.width;
  const typeBoxMarginX = (cardWidth - TYPELINE_WIDTH) / 2;

  drawTypeLine(ctx, {
    cardType,
    cardColorTreatment,
    x: position === 'left' ? typeBoxMarginX : cardWidth / 2,
    y: SUBCARD_TYPELINE_Y,
    width: TYPELINE_WIDTH / 2,
    height: SUBCARD_TYPELINE_HEIGHT,
    fontSize: SUBCARD_TYPELINE_FONT_SIZE,
    inkLevel,
    flatSide: position === 'left' ? 'right' : 'left',
  });
};
