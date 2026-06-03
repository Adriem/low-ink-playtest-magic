import { drawRoundedBox } from '../../../utils/canvasShapes';
import { getColorIdentityStyle } from '../../../utils/canvasStyles';
import { fitFontSizeInX } from '../../../utils/canvasText';
import { isArtifactType, MinimalistColors } from '../../../utils/colors';

export const drawTypeBox = (ctx, {
  cardType,
  cardColorIdentity,
  x = 29,
  width,
  y = 170,
  height = 50,
  flatSide,
}) => {
  const boxWidth = width ?? ctx.canvas.width - x * 2;
  const right = x + boxWidth;

  const innerLeftPad = flatSide === 'left' ? 0 : 4;
  const innerRightPad = flatSide === 'right' ? 0 : 4;
  const innerX = x + innerLeftPad;
  const innerRight = right - innerRightPad;
  const innerY = y + 5;
  const innerHeight = height - 12;

  const textX = flatSide === 'left' ? x + 8 : x + 16;
  const textRight = flatSide === 'right' ? right - 8 : right - 16;
  const textY = y + 33;

  drawRoundedBox(ctx, {
    x,
    y,
    width: boxWidth,
    height,
    lineWidth: 0,
    fillStyle: getColorIdentityStyle(ctx, cardColorIdentity, { palettte: MinimalistColors }),
    flatSide,
  });

  drawRoundedBox(ctx, {
    x: innerX,
    y: innerY,
    width: innerRight - innerX,
    height: innerHeight,
    lineWidth: 3,
    strokeStyle: 'white',
    fillStyle: 'white',
    flatSide,
  });

  ctx.font = "bold 22px Verdana";

  // Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.textAlign = 'start';
  fitFontSizeInX(ctx, cardType.toUpperCase(), textRight - textX);
  ctx.fillText(cardType.toUpperCase(), textX + 1, textY + 1);

  // Actual text
  ctx.fillStyle = cardColorIdentity === 'colorless' ? 'gray' : 'black';
  ctx.textAlign = 'start';
  fitFontSizeInX(ctx, cardType.toUpperCase(), textRight - textX);
  ctx.fillText(cardType.toUpperCase(), textX, textY);
};

