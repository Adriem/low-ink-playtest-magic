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
import { toTextParagraphs } from '../../common/textRuns';
import type { ColorTreatment } from '../../../../domain/colorTreatment';
import type { OracleText } from '../../../../domain/oracleText';

/**
 * Draw the extra oracle box of saga creatures, below their type line, with
 * their creature abilities. The text is centered above the stats box, which
 * overlaps the bottom of the box.
 */
export const drawSagaCreatureOracleBox = (
  ctx: CanvasRenderingContext2D,
  { cardOracleText, cardColorTreatment }: { cardOracleText: OracleText; cardColorTreatment: ColorTreatment },
) => {
  const inner = drawFramedBox(ctx, {
    x: (ctx.canvas.width - CONTENT_WIDTH) / 2,
    y: SAGA_CREATURE_ORACLE_Y,
    width: CONTENT_WIDTH,
    height: SAGA_CREATURE_ORACLE_HEIGHT,
    cardColorTreatment,
    shape: 'rectangle',
  });

  const textTop = inner.y + PINLINE_THICKNESS;
  drawTextInArea(ctx, {
    paragraphs: toTextParagraphs(cardOracleText.paragraphs),
    x: inner.x + PINLINE_THICKNESS + ORACLE_TEXT_PADDING_X,
    y: textTop,
    width: inner.width - PINLINE_THICKNESS * 2 - ORACLE_TEXT_PADDING_X * 2,
    height: STATSLINE_Y - textTop,
  });
};
