import { fitFontSizeInX } from '../../common/canvasText';
import {
  CAPSULE_TEXT_INSET,
  FONT_FAMILY,
  PINLINE_THICKNESS,
  TITLE_WIDTH,
  TYPELINE_FONT_SIZE,
  TYPELINE_HEIGHT,
  TYPELINE_TEXT_BASELINE_OFFSET,
  TYPELINE_Y,
} from '../config';
import { drawFramedBox } from './drawFramedBox';
import { hasCardBackground } from './drawOuterFrame';
import { REALISTIC_PALETTE } from '../palette';
import type { ColorTreatment } from '../../../../domain/colorTreatment';
import type { InkLevel } from '../../styles';

export const drawTypeBox = (
  ctx: CanvasRenderingContext2D,
  {
    cardType = '',
    cardColorTreatment,
    inkLevel,
    y = TYPELINE_Y,
  }: { cardType?: string; cardColorTreatment: ColorTreatment; inkLevel?: InkLevel; y?: number },
) => {
  const x = (ctx.canvas.width - TITLE_WIDTH) / 2;
  const width = TITLE_WIDTH;
  const height = TYPELINE_HEIGHT;

  drawFramedBox(ctx, {
    x,
    y,
    width,
    height,
    cardColorTreatment,
    shape: 'capsule',
    inkLevel,
    // Over the card background, filled as lightly as the oracle box
    inkFillStrength: inkLevel && hasCardBackground(inkLevel) ? 'light' : 'regular',
    innerHeightAdjustment: -2,
  });

  const textX = x + PINLINE_THICKNESS * 2 + CAPSULE_TEXT_INSET;
  const textRight = x + width - PINLINE_THICKNESS * 2 - CAPSULE_TEXT_INSET;
  const innerCenterY = y + height / 2;

  ctx.font = `bold ${TYPELINE_FONT_SIZE}px ${FONT_FAMILY}`;
  ctx.fillStyle = REALISTIC_PALETTE.TEXT;
  ctx.textAlign = 'start';
  fitFontSizeInX(ctx, cardType, textRight - textX);
  ctx.fillText(cardType, textX, innerCenterY + TYPELINE_TEXT_BASELINE_OFFSET);
};
