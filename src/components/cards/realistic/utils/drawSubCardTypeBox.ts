import { fitFontSizeInX } from '../../common/canvasText';
import {
  CAPSULE_TEXT_INSET,
  FONT_FAMILY,
  PINLINE_THICKNESS,
  SUBCARD_TYPELINE_FONT_SIZE,
  SUBCARD_TYPELINE_HEIGHT,
  SUBCARD_TYPELINE_Y,
  TITLE_WIDTH,
} from '../config';
import { drawFramedBox } from './drawFramedBox';
import type { SubCardPosition } from '../../../../domain/cards';
import { REALISTIC_PALETTE } from '../palette';
import type { CardColorTreatment } from '../../../../domain/colorTreatment';
import type { InkLevel } from '../../styles';

export const drawSubCardTypeBox = (
  ctx: CanvasRenderingContext2D,
  {
    cardType = '',
    cardColorTreatment,
    inkLevel,
    position,
  }: { cardType?: string; cardColorTreatment: CardColorTreatment; inkLevel?: InkLevel; position: SubCardPosition },
) => {
  const x = position === 'left' ? (ctx.canvas.width - TITLE_WIDTH) / 2 : ctx.canvas.width / 2;
  const y = SUBCARD_TYPELINE_Y;
  const width = TITLE_WIDTH / 2;
  const height = SUBCARD_TYPELINE_HEIGHT;
  const flatSide = position === 'left' ? 'right' : 'left';

  drawFramedBox(ctx, {
    x,
    y,
    width,
    height,
    cardColorTreatment,
    shape: 'capsule',
    inkLevel,
    flatSide,
  });

  const textX = flatSide === 'left' ? x + PINLINE_THICKNESS : x + PINLINE_THICKNESS * 2 + CAPSULE_TEXT_INSET;
  const textRight =
    flatSide === 'right' ? x + width - PINLINE_THICKNESS : x + width - PINLINE_THICKNESS * 2 - CAPSULE_TEXT_INSET;
  const innerCenterY = y + height / 2;

  ctx.font = `bold ${SUBCARD_TYPELINE_FONT_SIZE}px ${FONT_FAMILY}`;
  ctx.fillStyle = REALISTIC_PALETTE.TEXT;
  ctx.textAlign = 'start';
  fitFontSizeInX(ctx, cardType, textRight - textX);
  ctx.fillText(cardType, textX, innerCenterY + SUBCARD_TYPELINE_FONT_SIZE / 3);
};
