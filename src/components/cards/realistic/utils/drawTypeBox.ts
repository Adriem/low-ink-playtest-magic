import type { Orientation } from '../../../../domain/cards';
import type { Palette } from '../../../../domain/colorTreatment';
import { fitFontSizeInX } from '../../common/canvasText';
import {
  CAPSULE_TEXT_INSET,
  FONT_FAMILY,
  PINLINE_THICKNESS,
  TYPELINE_FONT_SIZE,
  TYPELINE_HEIGHT,
  TYPELINE_TEXT_BASELINE_OFFSET,
  CARD_LAYOUTS,
} from '../config';
import { drawFramedBox } from './drawFramedBox';
import { hasCardBackground } from './drawCardBackground';
import type { CardColorTreatment } from '../../../../domain/colorTreatment';
import type { InkLevel } from '../../styles';

export const drawTypeBox = (
  ctx: CanvasRenderingContext2D,
  {
    palette,
    cardType = '',
    cardColorTreatment,
    inkLevel,
    orientation = 'portrait',
    y = CARD_LAYOUTS[orientation].typelineY,
  }: {
    palette: Palette;
    cardType?: string;
    cardColorTreatment: CardColorTreatment;
    inkLevel?: InkLevel;
    /** Which way the card is drawn: landscape cards (e.g. battles) are laid out sideways */
    orientation?: Orientation;
    y?: number;
  },
) => {
  const { width: cardWidth, titleWidth: width } = CARD_LAYOUTS[orientation];
  const x = (cardWidth - width) / 2;
  const height = TYPELINE_HEIGHT;

  drawFramedBox(ctx, {
    palette,
    x,
    y,
    width,
    height,
    cardColorTreatment,
    shape: 'capsule',
    orientation,
    inkLevel,
    // Over the card background, filled as lightly as the oracle box
    inkFillStrength: inkLevel && hasCardBackground(inkLevel) ? 'light' : 'regular',
    innerHeightAdjustment: -2,
  });

  const textX = x + PINLINE_THICKNESS * 2 + CAPSULE_TEXT_INSET;
  const textRight = x + width - PINLINE_THICKNESS * 2 - CAPSULE_TEXT_INSET;
  const innerCenterY = y + height / 2;

  ctx.font = `bold ${TYPELINE_FONT_SIZE}px ${FONT_FAMILY}`;
  ctx.fillStyle = palette.TEXT;
  ctx.textAlign = 'start';
  fitFontSizeInX(ctx, cardType, textRight - textX);
  ctx.fillText(cardType, textX, innerCenterY + TYPELINE_TEXT_BASELINE_OFFSET);
};
