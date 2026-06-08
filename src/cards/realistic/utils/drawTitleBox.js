import { drawRoundedBox } from '../../../utils/canvasShapes';
import { getColorIdentityStyle } from '../../../utils/canvasStyles';
import { fitFontSizeInX } from '../../../utils/canvasText';
import { calculateManaCostWidth, renderManaCost } from '../../../utils/manaCostRenderer';
import {
  CAPSULE_INNER_STROKE,
  MANA_SYMBOL_DIAMETER,
  MANA_SYMBOL_EDGE_PADDING,
  MANA_SYMBOL_SPACING,
  PINLINE_THICKNESS,
  TITLE_FONT_SIZE,
  TITLE_HEIGHT,
  TITLE_WIDTH,
  TITLE_Y,
} from '../config';

export const drawTitleBox = (ctx, {
  cardName,
  cardColorIdentity,
  cardManaCost,
}) => {
  const x = (ctx.canvas.width - TITLE_WIDTH) / 2;
  const y = TITLE_Y;
  const width = TITLE_WIDTH;
  const height = TITLE_HEIGHT;

  const [...manaSymbols] = cardManaCost.match(/({.*?})/g) || [];
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
    strokeStyle: 'black',
    fillStyle: 'white',
  });

  const textX = x + PINLINE_THICKNESS * 2 + 7;
  const innerCenterY = y + height / 2;
  const manaAnchorRight = x + width - PINLINE_THICKNESS - 8;
  const titleEndX = manaSymbols.length
    ? manaAnchorRight - manaCostWidth - MANA_SYMBOL_EDGE_PADDING
    : x + width - PINLINE_THICKNESS * 2 - 7;

  ctx.font = `bold ${TITLE_FONT_SIZE}px Serif`;
  ctx.fillStyle = 'black';
  ctx.textAlign = 'start';
  fitFontSizeInX(ctx, cardName, titleEndX - textX);
  ctx.fillText(cardName, textX, innerCenterY + 9);

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
