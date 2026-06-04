import { drawRectangle } from '../../../utils/canvasShapes';
import { getColorIdentityStyle } from '../../../utils/canvasStyles';
import { fillMultilineText, fitFontSizeInXY } from '../../../utils/canvasText';
import { SUBCARD_ORACLE_FONT_SIZE, SUBCARD_ORACLE_HEIGHT, SUBCARD_ORACLE_Y, PINLINE_THICKNESS, CONTENT_WIDTH } from '../config';

const TEXT_PADDING_FROM_CENTER = 15;
const TEXT_PADDING_FROM_OUTSIDE = 10;

const drawOracleBorder = (ctx, { cardColorIdentity, position, y }) => {
  const x = position === 'right'
    ? ctx.canvas.width / 2 + PINLINE_THICKNESS / 2
    : (ctx.canvas.width - CONTENT_WIDTH) / 2;
  const width = CONTENT_WIDTH / 2 - PINLINE_THICKNESS / 2;

  drawRectangle(ctx, {
    x,
    y,
    width,
    height: PINLINE_THICKNESS,
    fillStyle: getColorIdentityStyle(ctx, cardColorIdentity),
  });
};

export const drawSubCardOracleBox = (ctx, {
  cardOracleText,
  cardColorIdentity,
  position,
}) => {
  const cardWidth = ctx.canvas.width;
  const textMarginX = (cardWidth - CONTENT_WIDTH) / 2;

  const textX = position === 'left'
    ? textMarginX + TEXT_PADDING_FROM_OUTSIDE
    : ctx.canvas.width / 2 + PINLINE_THICKNESS / 2 + TEXT_PADDING_FROM_CENTER;
  const textWidth = CONTENT_WIDTH / 2 - PINLINE_THICKNESS / 2 - TEXT_PADDING_FROM_CENTER - TEXT_PADDING_FROM_OUTSIDE;

  drawOracleBorder(ctx, {
    cardColorIdentity,
    position,
    y: SUBCARD_ORACLE_Y + SUBCARD_ORACLE_HEIGHT
  });

  ctx.font = `${SUBCARD_ORACLE_FONT_SIZE}px Verdana`;
  ctx.fillStyle = 'black';
  ctx.textAlign = 'start';

  fillMultilineText(ctx, fitFontSizeInXY(
    ctx,
    (cardOracleText ?? '').split('\n'),
    textWidth,
    SUBCARD_ORACLE_HEIGHT,
  ), textX, SUBCARD_ORACLE_Y);
};
