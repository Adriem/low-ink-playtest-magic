import { fillMultilineText, fitOracleLines } from '../../common/oracleTextRenderer';
import {
  CONTENT_WIDTH,
  FONT_FAMILY,
  PINLINE_THICKNESS,
  SUBCARD_ORACLE_FONT_SIZE,
  SUBCARD_ORACLE_HEIGHT,
  SUBCARD_ORACLE_Y,
} from '../config';
import { drawFramedBox } from './drawFramedBox';
import type { SubCardPosition } from '../../../../domain/cards';
import { REALISTIC_PALETTE } from '../palette';
import type { CardColorTreatment } from '../../../../domain/colorTreatment';
import type { OracleText } from '../../../../domain/oracleText';
import type { InkLevel } from '../../styles';

export const drawSubCardOracleBox = (
  ctx: CanvasRenderingContext2D,
  {
    cardOracleText,
    cardColorTreatment,
    inkLevel,
    position,
  }: {
    cardOracleText?: OracleText;
    cardColorTreatment: CardColorTreatment;
    inkLevel?: InkLevel;
    position: SubCardPosition;
  },
) => {
  const x = position === 'left' ? (ctx.canvas.width - CONTENT_WIDTH) / 2 : ctx.canvas.width / 2;
  const y = SUBCARD_ORACLE_Y;
  const width = CONTENT_WIDTH / 2;
  const height = SUBCARD_ORACLE_HEIGHT;
  const flatSide = position === 'left' ? 'right' : 'left';

  const {
    x: innerX,
    y: innerY,
    width: innerWidth,
    height: innerHeight,
  } = drawFramedBox(ctx, {
    x,
    y,
    width,
    height,
    cardColorTreatment,
    inkLevel,
    inkFillStrength: 'light',
    shape: 'rectangle',
    flatSide,
  });

  const textPadding = PINLINE_THICKNESS + 4;
  const textX = innerX + textPadding;
  const textRight = innerX + innerWidth - textPadding;
  const textTopY = innerY + 22;
  const textBottomY = innerY + innerHeight - 6;

  ctx.font = `${SUBCARD_ORACLE_FONT_SIZE}px ${FONT_FAMILY}`;
  ctx.fillStyle = REALISTIC_PALETTE.TEXT;
  ctx.textAlign = 'start';

  fillMultilineText(
    ctx,
    fitOracleLines(ctx, cardOracleText?.lines ?? [], textRight - textX, textBottomY - textTopY),
    textX,
    textTopY,
  );
};
