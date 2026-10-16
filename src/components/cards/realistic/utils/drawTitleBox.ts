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
import { REALISTIC_PALETTE } from '../palette';
import type { ColorTreatment } from '../../../../domain/colorTreatment';

export const drawTitleBox = (ctx: CanvasRenderingContext2D, {
  cardName,
  cardColorTreatment,
  cardManaCost,
}: { cardName: string, cardColorTreatment: ColorTreatment, cardManaCost?: string }) => {
  const x = (ctx.canvas.width - TITLE_WIDTH) / 2;
  const y = TITLE_Y;
  const width = TITLE_WIDTH;
  const height = TITLE_HEIGHT;

  const manaSymbols = splitSymbols(cardManaCost ?? '');
  const manaCostWidth = calculateManaCostWidth({
    manaSymbols,
    symbolDiameter: MANA_SYMBOL_DIAMETER,
    symbolSpacing: MANA_SYMBOL_SPACING,
  });

  drawFramedBox(ctx, {
    x,
    y,
    width,
    height,
    cardColorTreatment,
    shape: 'capsule',
    innerHeightAdjustment: -2,
  });

  const textX = x + PINLINE_THICKNESS * 2 + CAPSULE_TEXT_INSET;
  const innerCenterY = y + height / 2;
  const manaAnchorRight = x + width - PINLINE_THICKNESS - 8;
  const titleEndX = manaSymbols.length
    ? manaAnchorRight - manaCostWidth - MANA_SYMBOL_EDGE_PADDING
    : x + width - PINLINE_THICKNESS * 2 - CAPSULE_TEXT_INSET;

  ctx.font = `bold ${TITLE_FONT_SIZE}px ${FONT_FAMILY}`;
  ctx.fillStyle = REALISTIC_PALETTE.TEXT;
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
