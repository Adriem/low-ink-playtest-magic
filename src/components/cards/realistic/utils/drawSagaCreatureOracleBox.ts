import type { Palette } from '../../../../domain/colorTreatment';
import {
  CONTENT_WIDTH,
  ORACLE_TEXT_PADDING_X,
  PINLINE_THICKNESS,
  SAGA_CREATURE_ORACLE_HEIGHT,
  SAGA_CREATURE_ORACLE_Y,
  STATSLINE_Y,
} from '../config';
import { drawFramedBox } from './drawFramedBox';
import { drawTextInArea } from './drawOracleText';
import type { CardColorTreatment } from '../../../../domain/colorTreatment';
import type { OracleText } from '../../../../domain/oracleText';
import type { InkLevel } from '../../styles';

/**
 * Draw the extra oracle box of saga creatures, below their type line, with
 * their creature abilities. The text is centered above the stats box, which
 * overlaps the bottom of the box.
 */
export const drawSagaCreatureOracleBox = (
  ctx: CanvasRenderingContext2D,
  {
    palette,
    cardOracleText,
    cardColorTreatment,
    inkLevel,
  }: { palette: Palette; cardOracleText: OracleText; cardColorTreatment: CardColorTreatment; inkLevel?: InkLevel },
) => {
  const inner = drawFramedBox(ctx, {
    palette,
    x: (ctx.canvas.width - CONTENT_WIDTH) / 2,
    y: SAGA_CREATURE_ORACLE_Y,
    width: CONTENT_WIDTH,
    height: SAGA_CREATURE_ORACLE_HEIGHT,
    cardColorTreatment,
    inkLevel,
    inkFillStrength: 'light',
    shape: 'rectangle',
  });

  const textTop = inner.y + PINLINE_THICKNESS;
  drawTextInArea(ctx, {
    palette,
    lines: cardOracleText.lines,
    x: inner.x + PINLINE_THICKNESS + ORACLE_TEXT_PADDING_X,
    y: textTop,
    width: inner.width - PINLINE_THICKNESS * 2 - ORACLE_TEXT_PADDING_X * 2,
    height: STATSLINE_Y - textTop,
  });
};
