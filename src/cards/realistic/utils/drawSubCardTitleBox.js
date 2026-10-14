import { fitFontSizeInX } from '../../../utils/canvasText';
import { calculateManaCostWidth, parseManaSymbols, renderManaCost } from '../../../utils/manaCostRenderer';
import {
  CAPSULE_TEXT_INSET,
  FONT_FAMILY,
  PINLINE_THICKNESS,
  SUBCARD_MANA_SYMBOL_DIAMETER,
  SUBCARD_MANA_SYMBOL_EDGE_PADDING,
  SUBCARD_MANA_SYMBOL_SPACING,
  SUBCARD_TITLE_FONT_SIZE,
  SUBCARD_TITLE_HEIGHT,
  SUBCARD_TITLE_Y,
  TITLE_WIDTH,
} from '../config';
import { InkColors } from '../../../utils/colors';
import { drawFramedBox } from './drawFramedBox';

export const drawSubCardTitleBox = (ctx, {
  cardName,
  cardManaCost,
  cardColorIdentity,
  position,
}) => {
  const x = position === 'left' ? (ctx.canvas.width - TITLE_WIDTH) / 2 : ctx.canvas.width / 2;
  const y = SUBCARD_TITLE_Y;
  const width = TITLE_WIDTH / 2;
  const height = SUBCARD_TITLE_HEIGHT;
  const flatSide = position === 'left' ? 'right' : 'left';

  const manaSymbols = parseManaSymbols(cardManaCost);
  const manaCostWidth = calculateManaCostWidth({
    manaSymbols,
    symbolDiameter: SUBCARD_MANA_SYMBOL_DIAMETER,
    symbolSpacing: SUBCARD_MANA_SYMBOL_SPACING,
  });

  const inner = drawFramedBox(ctx, {
    x,
    y,
    width,
    height,
    cardColorIdentity,
    shape: 'capsule',
    flatSide,
  });

  const textX = flatSide === 'left' ? x + PINLINE_THICKNESS : x + PINLINE_THICKNESS * 2 + CAPSULE_TEXT_INSET;
  const textRight = flatSide === 'right' ? x + width - PINLINE_THICKNESS : x + width - PINLINE_THICKNESS * 2 - CAPSULE_TEXT_INSET;
  const innerCenterY = y + height / 2;

  const manaAnchorRight = inner.x + inner.width - PINLINE_THICKNESS - 4;
  const titleEndX = manaSymbols.length
    ? manaAnchorRight - manaCostWidth - SUBCARD_MANA_SYMBOL_EDGE_PADDING
    : textRight;

  ctx.font = `bold ${SUBCARD_TITLE_FONT_SIZE}px ${FONT_FAMILY}`;
  ctx.fillStyle = InkColors.TEXT;
  ctx.textAlign = 'start';
  fitFontSizeInX(ctx, cardName, titleEndX - textX);
  ctx.fillText(cardName, textX, innerCenterY + SUBCARD_TITLE_FONT_SIZE / 3);

  if (manaSymbols.length > 0) {
    renderManaCost(ctx, {
      manaSymbols,
      x: manaAnchorRight - manaCostWidth,
      y: innerCenterY - SUBCARD_MANA_SYMBOL_DIAMETER / 2,
      symbolDiameter: SUBCARD_MANA_SYMBOL_DIAMETER,
      symbolSpacing: SUBCARD_MANA_SYMBOL_SPACING,
    });
  }
};
