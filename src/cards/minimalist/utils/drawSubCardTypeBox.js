import { drawRoundedBox } from '../../../utils/canvasShapes';
import { getColorIdentityStyle } from '../../../utils/canvasStyles';
import { fitFontSizeInX } from '../../../utils/canvasText';
import { MinimalistColors } from '../../../utils/colors';
import { SUBCARD_TYPELINE_FONT_SIZE, SUBCARD_TYPELINE_HEIGHT, SUBCARD_TYPELINE_Y, PINLINE_THICKNESS, TYPELINE_WIDTH } from '../config';
import { getFontSize } from '../../../utils/canvasText';

const TYPELINE_BOX_PADDING_X = 15;

export const drawSubCardTypeBox = (ctx, { cardType, cardColorIdentity, position }) => {
  const cardWidth = ctx.canvas.width;
  const typeBoxMarginX = (cardWidth - TYPELINE_WIDTH) / 2;
  const flatSide = position === 'left' ? 'right' : 'left';
  const subcardTypelineWidth = TYPELINE_WIDTH / 2;

  drawRoundedBox(ctx, {
    x: position === 'left' ? typeBoxMarginX : cardWidth / 2,
    y: SUBCARD_TYPELINE_Y,
    width: subcardTypelineWidth,
    height: SUBCARD_TYPELINE_HEIGHT,
    lineWidth: 0,
    fillStyle: getColorIdentityStyle(ctx, cardColorIdentity, { palette: MinimalistColors }),
    flatSide,
  });

  const innerLineWidth = 3;

  drawRoundedBox(ctx, {
    x: position === 'left' ? typeBoxMarginX + PINLINE_THICKNESS : cardWidth / 2 + PINLINE_THICKNESS,
    y: SUBCARD_TYPELINE_Y + PINLINE_THICKNESS,
    width: subcardTypelineWidth - PINLINE_THICKNESS * 2,
    height: SUBCARD_TYPELINE_HEIGHT - PINLINE_THICKNESS * 2 - innerLineWidth,
    lineWidth: innerLineWidth,
    strokeStyle: 'white',
    fillStyle: 'white',
    flatSide,
  });

  ctx.font = `bold ${SUBCARD_TYPELINE_FONT_SIZE}px Verdana`;

  const textX = position === 'left'
    ? typeBoxMarginX + TYPELINE_BOX_PADDING_X
    : cardWidth / 2 + PINLINE_THICKNESS + TYPELINE_BOX_PADDING_X;
  const textWidth = subcardTypelineWidth - TYPELINE_BOX_PADDING_X * 2;

  ctx.fillStyle = cardColorIdentity === 'colorless' ? 'gray' : 'black';
  ctx.textAlign = 'start';
  fitFontSizeInX(ctx, cardType.toUpperCase(), textWidth);
  const textY = SUBCARD_TYPELINE_Y + SUBCARD_TYPELINE_HEIGHT * 0.66 - (SUBCARD_TYPELINE_FONT_SIZE - getFontSize(ctx)) * 0.33;
  ctx.fillText(cardType.toUpperCase(), textX, textY);
};

