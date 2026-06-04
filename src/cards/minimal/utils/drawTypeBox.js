import { drawRoundedBox } from '../../../utils/canvasShapes';
import { getColorIdentityStyle } from '../../../utils/canvasStyles';
import { fitFontSizeInX } from '../../../utils/canvasText';
import { MinimalistColors } from '../../../utils/colors';

export const drawTypeBox = (ctx, { cardType, cardColorIdentity }) => {
  const typeOriginX = 45;
  const typeEndX = ctx.canvas.width - 45;

  drawRoundedBox(ctx, {
    x: 29,
    y: 170,
    width: ctx.canvas.width - 29 * 2,
    height: 50,
    lineWidth: 0,
    fillStyle: getColorIdentityStyle(ctx, cardColorIdentity, { palettte: MinimalistColors }),
  });

  drawRoundedBox(ctx, {
    x: 33,
    y: 175,
    width: ctx.canvas.width - 33 * 2,
    height: 38,
    lineWidth: 3,
    strokeStyle: 'white',
    fillStyle: 'white',
  });

  ctx.font = "bold 22px Verdana";

  // Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.textAlign = 'start';
  fitFontSizeInX(ctx, cardType.toUpperCase(), typeEndX - typeOriginX);
  ctx.fillText(cardType.toUpperCase(), 46, 204);

  // Actual text
  ctx.fillStyle = cardColorIdentity === 'colorless' ? 'gray' : 'black';
  ctx.textAlign = 'start';
  fitFontSizeInX(ctx, cardType.toUpperCase(), typeEndX - typeOriginX);
  ctx.fillText(cardType.toUpperCase(), 45, 203);
};
