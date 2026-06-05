import { drawRoundedBox } from '../../../utils/canvasShapes';
import { getColorIdentityStyle } from '../../../utils/canvasStyles';
import { fitFontSizeInX } from '../../../utils/canvasText';
import { getSymbolImage } from '../../../utils/symbols';
import { PINLINE_THICKNESS, TITLE_FONT_SIZE, TITLE_HEIGHT, TITLE_WIDTH, TITLE_Y } from '../config';

const MANA_SYMBOL_DIAMETER = 24;
const MANA_SYMBOL_SPACING = 2.5;
const MANA_SYMBOL_EDGE_PADDING = 10;

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
    lineWidth: 2,
    strokeStyle: 'black',
    fillStyle: 'white',
  });

  const textX = x + PINLINE_THICKNESS * 2 + 7;
  const innerCenterY = y + height / 2;
  const manaAnchorRight = x + width - PINLINE_THICKNESS - 8;
  const manaTotalWidth = manaSymbols.length * MANA_SYMBOL_DIAMETER
    + Math.max(manaSymbols.length - 1, 0) * MANA_SYMBOL_SPACING;
  const titleEndX = manaSymbols.length
    ? manaAnchorRight - manaTotalWidth - MANA_SYMBOL_EDGE_PADDING
    : x + width - PINLINE_THICKNESS * 2 - 7;

  ctx.font = `bold ${TITLE_FONT_SIZE}px Serif`;
  ctx.fillStyle = 'black';
  ctx.textAlign = 'start';
  fitFontSizeInX(ctx, cardName, titleEndX - textX);
  ctx.fillText(cardName, textX, innerCenterY + 9);

  manaSymbols.forEach(async (symbol, i) => {
    const radius = MANA_SYMBOL_DIAMETER / 2;
    const originX = manaAnchorRight - radius - (MANA_SYMBOL_DIAMETER + MANA_SYMBOL_SPACING) * (manaSymbols.length - i - 1);
    const originY = innerCenterY;

    ctx.beginPath();
    ctx.fillStyle = '#424242';
    ctx.arc(originX - 1, originY + 2, radius, 0, 2 * Math.PI);
    ctx.fill();

    ctx.beginPath();
    ctx.fillStyle = 'lightgray';
    ctx.arc(originX, originY, radius, 0, 2 * Math.PI);
    ctx.fill();

    const symbolImage = await getSymbolImage(symbol);
    ctx.drawImage(
      symbolImage,
      originX - radius,
      originY - radius,
      2 * radius,
      2 * radius,
    );
  });
};
