import type { Palette } from '../../../../domain/colorTreatment';
import { getFontSize, getMultilineTextHeight, toPlainText } from '../../common/canvasText';
import { fillMultilineText, fitOracleLines } from '../../common/oracleTextRenderer';
import type { OracleLine, OracleText } from '../../../../domain/oracleText';
import { FONT_FAMILY, ORACLE_FONT_SIZE } from '../config';

interface TextArea {
  lines: OracleLine[];
  width: number;
  height: number;
  padding?: number;
  fontSize?: number;
}

/**
 * Draw the card's rules text in the given area, shrinking it until it fits.
 *
 * @param options.y - Baseline of the first line, or with `fromTop` the top of
 *   the text, where the first line starts at whatever size it's shrunk to
 */
export const drawOracleText = (
  ctx: CanvasRenderingContext2D,
  {
    palette,
    cardOracleText,
    x,
    y,
    width,
    height,
    fromTop = false,
  }: {
    palette: Palette;
    cardOracleText: OracleText;
    x: number;
    y: number;
    width: number;
    height: number;
    fromTop?: boolean;
  },
) => {
  ctx.font = `${ORACLE_FONT_SIZE}px ${FONT_FAMILY}`;
  ctx.fillStyle = palette.TEXT;
  ctx.textAlign = 'start';

  const lines = fitOracleLines(ctx, cardOracleText.lines, width, height);
  const baseline = fromTop && lines.length ? y + ctx.measureText(toPlainText(lines[0])).fontBoundingBoxAscent : y;
  fillMultilineText(ctx, lines, x, baseline);
};

/**
 * Font size at which rules text fits inside an area minus its padding.
 */
export const getFittingFontSize = (
  ctx: CanvasRenderingContext2D,
  { lines, width, height, padding = 0, fontSize = ORACLE_FONT_SIZE }: TextArea,
): number => {
  ctx.font = `${fontSize}px ${FONT_FAMILY}`;
  fitOracleLines(ctx, lines, width, height - padding * 2);
  return getFontSize(ctx);
};

/**
 * Draw rules text inside an area, starting at the given font size and
 * shrinking it until it fits within the area minus its padding, either at the
 * top of the area or centered in it.
 */
export const drawTextInArea = (
  ctx: CanvasRenderingContext2D,
  {
    palette,
    lines,
    x,
    y,
    width,
    height,
    padding = 0,
    align = 'center',
    fontSize = ORACLE_FONT_SIZE,
  }: TextArea & { palette: Palette; x: number; y: number; align?: 'top' | 'center' },
) => {
  ctx.font = `${fontSize}px ${FONT_FAMILY}`;
  ctx.fillStyle = palette.TEXT;
  ctx.textAlign = 'start';

  const fittedLines = fitOracleLines(ctx, lines, width, height - padding * 2);
  const { fontBoundingBoxAscent: ascent } = ctx.measureText('');
  const textHeight = getMultilineTextHeight(ctx, fittedLines);
  const textTop = align === 'top' ? y + padding : y + (height - textHeight) / 2;

  fillMultilineText(ctx, fittedLines, x, textTop + ascent);
};
