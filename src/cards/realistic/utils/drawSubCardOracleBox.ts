import { fillMultilineText, fitFontSizeInXY } from '../../../utils/canvasText';
import { CONTENT_WIDTH, FONT_FAMILY, PINLINE_THICKNESS, SUBCARD_ORACLE_FONT_SIZE, SUBCARD_ORACLE_HEIGHT, SUBCARD_ORACLE_Y } from '../config';
import { InkColors, type ColorIdentity } from '../../../utils/colors';
import { drawFramedBox } from './drawFramedBox';
import type { SubCardPosition } from '../../styles';

export const drawSubCardOracleBox = (ctx: CanvasRenderingContext2D, {
  cardOracleText,
  cardColorIdentity,
  position,
}: { cardOracleText?: string, cardColorIdentity?: ColorIdentity, position: SubCardPosition }) => {
  const x = position === 'left' ? (ctx.canvas.width - CONTENT_WIDTH) / 2 : ctx.canvas.width / 2;
  const y = SUBCARD_ORACLE_Y;
  const width = CONTENT_WIDTH / 2;
  const height = SUBCARD_ORACLE_HEIGHT;
  const flatSide = position === 'left' ? 'right' : 'left';

  const { x: innerX, y: innerY, width: innerWidth, height: innerHeight } = drawFramedBox(ctx, {
    x,
    y,
    width,
    height,
    cardColorIdentity,
    shape: 'rectangle',
    flatSide,
  });

  const textPadding = PINLINE_THICKNESS + 4;
  const textX = innerX + textPadding;
  const textRight = innerX + innerWidth - textPadding;
  const textTopY = innerY + 22;
  const textBottomY = innerY + innerHeight - 6;

  ctx.font = `${SUBCARD_ORACLE_FONT_SIZE}px ${FONT_FAMILY}`;
  ctx.fillStyle = InkColors.TEXT;
  ctx.textAlign = 'start';

  fillMultilineText(ctx, fitFontSizeInXY(
    ctx,
    (cardOracleText ?? '').split('\n'),
    textRight - textX,
    textBottomY - textTopY,
  ), textX, textTopY);
};
