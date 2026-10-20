import {
  CONTENT_WIDTH,
  ORACLE_FONT_SIZE,
  ORACLE_HEIGHT,
  ORACLE_TEXT_PADDING_X,
  ORACLE_TEXT_PADDING_Y,
  ORACLE_TEXT_STATS_CLEARANCE,
  ORACLE_Y,
  PINLINE_THICKNESS,
} from '../config';
import { drawFramedBox } from './drawFramedBox';
import { drawOracleText } from './drawOracleText';
import type { CardColorTreatment } from '../../../../domain/colorTreatment';
import type { InkLevel, OracleLayout } from '../../styles';
import type { OracleText } from '../../../../domain/oracleText';

export const drawOracleBox = (
  ctx: CanvasRenderingContext2D,
  {
    cardOracleText = { lines: [] },
    cardPower,
    cardToughness,
    cardColorTreatment,
    inkLevel,
    layout,
  }: {
    cardOracleText?: OracleText;
    cardPower?: string;
    cardToughness?: string;
    cardColorTreatment: CardColorTreatment;
    inkLevel?: InkLevel;
    layout: OracleLayout;
  },
) => {
  const x = layout === 'right-half' ? ctx.canvas.width / 2 : (ctx.canvas.width - CONTENT_WIDTH) / 2;
  const y = ORACLE_Y;
  const width = layout === 'full-width' ? CONTENT_WIDTH : CONTENT_WIDTH / 2;
  const height = ORACLE_HEIGHT;

  drawFramedBox(ctx, {
    x,
    y,
    width,
    height,
    cardColorTreatment,
    inkLevel,
    inkFillStrength: 'light',
    shape: 'rectangle',
  });

  const textPaddingX = ORACLE_TEXT_PADDING_X;
  const textPaddingTop = ORACLE_FONT_SIZE + ORACLE_TEXT_PADDING_Y;
  const textPaddingBottom =
    cardPower != null && cardToughness != null && layout !== 'left-half'
      ? ORACLE_TEXT_STATS_CLEARANCE
      : ORACLE_TEXT_PADDING_Y;

  drawOracleText(ctx, {
    cardOracleText,
    x: x + PINLINE_THICKNESS + textPaddingX,
    y: y + PINLINE_THICKNESS + textPaddingTop,
    width: width - PINLINE_THICKNESS * 2 - textPaddingX * 2,
    height: height - PINLINE_THICKNESS * 2 - textPaddingTop - textPaddingBottom,
  });
};
