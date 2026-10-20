import type { Palette } from '../../../../domain/colorTreatment';
import { fitFontSizeInX } from '../../common/canvasText';
import { splitSymbols } from '../../../../domain/symbols';
import { calculateManaCostWidth, renderManaCost } from '../../common/manaCostRenderer';
import {
  CAPSULE_TEXT_INSET,
  FONT_FAMILY,
  MANA_SYMBOL_DIAMETER,
  MANA_SYMBOL_EDGE_PADDING,
  MANA_SYMBOL_SPACING,
  PINLINE_THICKNESS,
  TITLE_FONT_SIZE,
  TITLE_HEIGHT,
  TITLE_TEXT_BASELINE_OFFSET,
  TITLE_WIDTH,
  TITLE_Y,
} from '../config';
import { drawFramedBox } from './drawFramedBox';
import { hasCardBackground } from './drawOuterFrame';
import type { CardColorTreatment } from '../../../../domain/colorTreatment';
import type { InkLevel } from '../../styles';

export const drawTitleBox = (
  ctx: CanvasRenderingContext2D,
  {
    palette,
    cardName,
    cardColorTreatment,
    inkLevel,
    cardManaCost,
    y = TITLE_Y,
  }: {
    palette: Palette;
    cardName: string;
    cardColorTreatment: CardColorTreatment;
    inkLevel?: InkLevel;
    cardManaCost?: string;
    /** Top of the box, higher on planeswalkers */
    y?: number;
  },
) => {
  const x = (ctx.canvas.width - TITLE_WIDTH) / 2;
  const width = TITLE_WIDTH;
  const height = TITLE_HEIGHT;

  const manaSymbols = splitSymbols(cardManaCost ?? '');
  const manaCostWidth = calculateManaCostWidth({
    manaSymbols,
    symbolDiameter: MANA_SYMBOL_DIAMETER,
    symbolSpacing: MANA_SYMBOL_SPACING,
  });

  drawFramedBox(ctx, {
    palette,
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
  const innerCenterY = y + height / 2;
  const manaAnchorRight = x + width - PINLINE_THICKNESS - 8;
  const titleEndX = manaSymbols.length
    ? manaAnchorRight - manaCostWidth - MANA_SYMBOL_EDGE_PADDING
    : x + width - PINLINE_THICKNESS * 2 - CAPSULE_TEXT_INSET;

  ctx.font = `bold ${TITLE_FONT_SIZE}px ${FONT_FAMILY}`;
  ctx.fillStyle = palette.TEXT;
  ctx.textAlign = 'start';
  fitFontSizeInX(ctx, cardName, titleEndX - textX);
  ctx.fillText(cardName, textX, innerCenterY + TITLE_TEXT_BASELINE_OFFSET);

  if (manaSymbols.length > 0) {
    renderManaCost(ctx, {
      manaSymbols,
      x: manaAnchorRight - manaCostWidth,
      y: innerCenterY - MANA_SYMBOL_DIAMETER / 2,
      symbolDiameter: MANA_SYMBOL_DIAMETER,
      symbolSpacing: MANA_SYMBOL_SPACING,
    });
  }
};
