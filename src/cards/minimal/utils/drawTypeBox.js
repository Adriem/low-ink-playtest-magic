import { drawRoundedBox } from '../../../utils/canvasShapes';
import { getColorIdentityStyle } from '../../../utils/canvasStyles';
import { fitFontSizeInX } from '../../../utils/canvasText';
import { MinimalistColors } from '../../../utils/colors';
import { TYPELINE_FONT_SIZE, TYPELINE_Y, TYPELINE_WIDTH, TYPELINE_HEIGHT, PINLINE_THICKNESS } from '../config';
import { getFontSize } from '../../../utils/canvasText';

const TYPELINE_BOX_PADDING_X = 15;

export const drawTypeBox = (ctx, { cardType, cardColorIdentity }) => {
  const cardWidth = ctx.canvas.width;
  const typeBoxMarginX = (cardWidth - TYPELINE_WIDTH) / 2;


  drawRoundedBox(ctx, {
    x: typeBoxMarginX,
    y: TYPELINE_Y,
    width: TYPELINE_WIDTH,
    height: TYPELINE_HEIGHT,
    lineWidth: 0,
    fillStyle: getColorIdentityStyle(ctx, cardColorIdentity, { palettte: MinimalistColors }),
  });

  const innerLineWidth = 3;

  drawRoundedBox(ctx, {
    x: typeBoxMarginX + PINLINE_THICKNESS,
    y: TYPELINE_Y + PINLINE_THICKNESS,
    width: TYPELINE_WIDTH - PINLINE_THICKNESS * 2,
    height: TYPELINE_HEIGHT - PINLINE_THICKNESS * 2 - innerLineWidth,
    lineWidth: innerLineWidth,
    strokeStyle: 'white',
    fillStyle: 'white',
  });

  ctx.font = `bold ${TYPELINE_FONT_SIZE}px Verdana`;

  const textX = typeBoxMarginX + TYPELINE_BOX_PADDING_X;
  const textWidth = TYPELINE_WIDTH - TYPELINE_BOX_PADDING_X * 2;

  ctx.fillStyle = cardColorIdentity === 'colorless' ? 'gray' : 'black';
  ctx.textAlign = 'start';
  fitFontSizeInX(ctx, cardType.toUpperCase(), textWidth);
  const textY = TYPELINE_Y + TYPELINE_HEIGHT * 0.66 - (TYPELINE_FONT_SIZE - getFontSize(ctx)) * 0.33;
  ctx.fillText(cardType.toUpperCase(), textX, textY);
};
