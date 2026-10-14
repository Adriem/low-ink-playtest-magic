import { drawRoundedBox } from '../../../utils/canvasShapes';
import { getColorIdentityStyle } from '../../../utils/canvasStyles';
import { fitFontSizeInX } from '../../../utils/canvasText';
import { calculateManaCostWidth, parseManaSymbols, renderManaCost } from '../../../utils/manaCostRenderer';
import {
  CAPSULE_INNER_STROKE,
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
import { InkColors } from '../../../utils/colors';

export const drawTitleBox = (ctx, {
  cardName,
  cardColorIdentity,
  cardManaCost,
}) => {
  const x = (ctx.canvas.width - TITLE_WIDTH) / 2;
  const y = TITLE_Y;
  const width = TITLE_WIDTH;
  const height = TITLE_HEIGHT;

  const manaSymbols = parseManaSymbols(cardManaCost);
  const manaCostWidth = calculateManaCostWidth({
    manaSymbols,
    symbolDiameter: MANA_SYMBOL_DIAMETER,
    symbolSpacing: MANA_SYMBOL_SPACING,
  });

  drawRoundedBox(ctx, {
    x,
    y,
    width,
    height,
    lineWidth: 0,
    fillStyle: getColorIdentityStyle(ctx, cardColorIdentity),
  });

  drawRoundedBox(ctx, {
    x: x + PINLINE_THICKNESS,
    y: y + PINLINE_THICKNESS,
    width: width - PINLINE_THICKNESS * 2,
    height: height - PINLINE_THICKNESS * 2 - 2,
    lineWidth: CAPSULE_INNER_STROKE,
    strokeStyle: InkColors.LINE,
    fillStyle: InkColors.PAPER,
  });

  const textX = x + PINLINE_THICKNESS * 2 + CAPSULE_TEXT_INSET;
  const innerCenterY = y + height / 2;
  const manaAnchorRight = x + width - PINLINE_THICKNESS - 8;
  const titleEndX = manaSymbols.length
    ? manaAnchorRight - manaCostWidth - MANA_SYMBOL_EDGE_PADDING
    : x + width - PINLINE_THICKNESS * 2 - CAPSULE_TEXT_INSET;

  ctx.font = `bold ${TITLE_FONT_SIZE}px ${FONT_FAMILY}`;
  ctx.fillStyle = InkColors.TEXT;
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
