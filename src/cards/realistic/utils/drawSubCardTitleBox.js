import { drawRoundedBox } from '../../../utils/canvasShapes';
import { getColorIdentityStyle } from '../../../utils/canvasStyles';
import { fitFontSizeInX } from '../../../utils/canvasText';
import { getSymbolImage } from '../../../utils/symbols';
import { PINLINE_THICKNESS, SUB_TITLE_FONT_SIZE, SUBCARD_TITLE_HEIGHT, SUBCARD_TITLE_Y, TITLE_WIDTH } from '../config';

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

  const manaSymbolWidth = 21;
  const manaSymbolMargin = 2.5;
  const manaSymbolEdgePadding = 10;
  const fontSize = SUB_TITLE_FONT_SIZE;

  const [...manaSymbols] = (cardManaCost ?? '').match(/({.*?})/g) || [];

  const innerLeftPad = flatSide === 'left' ? 0 : PINLINE_THICKNESS;
  const innerRightPad = flatSide === 'right' ? 0 : PINLINE_THICKNESS;
  const innerX = x + innerLeftPad;
  const innerWidth = width - innerLeftPad - innerRightPad;
  const innerY = y + PINLINE_THICKNESS;
  const innerHeight = height - PINLINE_THICKNESS * 2;

  drawRoundedBox(ctx, {
    x,
    y,
    width,
    height,
    lineWidth: 0,
    fillStyle: getColorIdentityStyle(ctx, cardColorIdentity),
    flatSide,
  });
  drawRoundedBox(ctx, {
    x: innerX,
    y: innerY,
    width: innerWidth,
    height: innerHeight,
    lineWidth: PINLINE_THICKNESS / 2,
    strokeStyle: 'black',
    fillStyle: 'white',
    flatSide,
  });

  const textX = flatSide === 'left' ? x + PINLINE_THICKNESS : x + PINLINE_THICKNESS * 2 + 7;
  const textRight = flatSide === 'right' ? x + width - PINLINE_THICKNESS : x + width - PINLINE_THICKNESS * 2 - 7;
  const innerCenterY = y + height / 2;

  const manaAnchorRight = innerX + innerWidth - PINLINE_THICKNESS - 4;
  const manaTotalWidth = manaSymbols.length * manaSymbolWidth
    + Math.max(manaSymbols.length - 1, 0) * manaSymbolMargin;
  const titleEndX = manaSymbols.length
    ? manaAnchorRight - manaTotalWidth - manaSymbolEdgePadding
    : textRight;

  ctx.font = `bold ${fontSize}px Serif`;
  ctx.fillStyle = 'black';
  ctx.textAlign = 'start';
  fitFontSizeInX(ctx, cardName, titleEndX - textX);
  ctx.fillText(cardName, textX, innerCenterY + fontSize / 3);

  manaSymbols.forEach(async (symbol, i) => {
    const radius = manaSymbolWidth / 2;
    const originX = manaAnchorRight - radius - (manaSymbolWidth + manaSymbolMargin) * (manaSymbols.length - i - 1);
    const originY = innerCenterY;

    ctx.beginPath();
    ctx.fillStyle = '#424242';
    ctx.arc(originX, originY + 2, radius, 0, 2 * Math.PI);
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
