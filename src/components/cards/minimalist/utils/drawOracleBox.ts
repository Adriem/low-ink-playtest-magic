import type { MinimalistPalette } from '../palette';
import { drawRectangle } from '../../common/canvasShapes';
import { fillMultilineText, fitOracleLinesIntoBox } from '../../common/oracleTextRenderer';
import {
  CONTENT_WIDTH,
  ORACLE_EXTENDED_EXTRA,
  ORACLE_FONT_SIZE,
  ORACLE_HEIGHT,
  ORACLE_TEXT_PADDING_TOP,
  ORACLE_Y,
  PINLINE_THICKNESS,
  TEXT_FONT_FAMILY,
} from '../config';
import type { OracleLayout } from '../../styles';
import { getPaletteColors, type CardColorTreatment } from '../../../../domain/colorTreatment';
import { getFillStyle } from '../../common/canvasStyles';
import type { OracleText } from '../../../../domain/oracleText';

const DIVIDER_TEXT_PADDING = 8;

export const drawOracleBox = (
  ctx: CanvasRenderingContext2D,
  {
    palette,
    cardOracleText,
    cardColorTreatment,
    cardPower,
    cardToughness,
    layout,
  }: {
    palette: MinimalistPalette;
    cardOracleText?: OracleText;
    cardColorTreatment: CardColorTreatment;
    cardPower?: string;
    cardToughness?: string;
    layout: OracleLayout;
  },
) => {
  const hasStats = cardPower != null && cardToughness != null;

  const x =
    layout === 'right-half' ? ctx.canvas.width / 2 + PINLINE_THICKNESS / 2 : (ctx.canvas.width - CONTENT_WIDTH) / 2;
  const y = ORACLE_Y;
  const width = layout === 'full-width' ? CONTENT_WIDTH : (CONTENT_WIDTH - PINLINE_THICKNESS) / 2;
  const height = hasStats ? ORACLE_HEIGHT : ORACLE_HEIGHT + ORACLE_EXTENDED_EXTRA;

  if (layout !== 'full-width') {
    drawSubCardDivider(ctx, { palette, cardColorTreatment, height });
  }
  drawOracleBorder(ctx, { palette, cardColorTreatment, layout, y: y + height });

  const textPaddingX = layout === 'full-width' ? 0 : DIVIDER_TEXT_PADDING;
  const textX = layout === 'right-half' ? x + textPaddingX : x;
  const textWidth = width - textPaddingX;

  const textPaddingTop = ORACLE_TEXT_PADDING_TOP;
  const textPaddingBottom = 0;
  const textY = y + textPaddingTop;
  const textHeight = height - textPaddingTop - textPaddingBottom;

  ctx.font = `${ORACLE_FONT_SIZE}px ${TEXT_FONT_FAMILY}`;
  ctx.fillStyle = palette.TEXT;
  ctx.textAlign = 'start';

  const paragraphs = fitOracleLinesIntoBox(ctx, cardOracleText?.lines ?? [], textWidth, textHeight);

  let currentY = textY;
  for (const paragraph of paragraphs) {
    fillMultilineText(ctx, paragraph.lines, textX, currentY);
    currentY += paragraph.paragraphHeight;
  }
};

const drawSubCardDivider = (
  ctx: CanvasRenderingContext2D,
  {
    palette,
    cardColorTreatment,
    height,
  }: { palette: MinimalistPalette; cardColorTreatment: CardColorTreatment; height: number },
) => {
  drawRectangle(ctx, {
    x: (ctx.canvas.width - PINLINE_THICKNESS) / 2,
    y: ORACLE_Y,
    width: PINLINE_THICKNESS,
    height: height,
    fillStyle: getFillStyle(ctx, getPaletteColors(cardColorTreatment.pinlineColors, palette)),
  });
};

const drawOracleBorder = (
  ctx: CanvasRenderingContext2D,
  {
    palette,
    cardColorTreatment,
    layout,
    y,
  }: { palette: MinimalistPalette; cardColorTreatment: CardColorTreatment; layout: OracleLayout; y: number },
) => {
  const x =
    layout === 'right-half' ? ctx.canvas.width / 2 - PINLINE_THICKNESS / 2 : (ctx.canvas.width - CONTENT_WIDTH) / 2;
  const width = layout === 'full-width' ? CONTENT_WIDTH : CONTENT_WIDTH / 2 + PINLINE_THICKNESS / 2;

  drawRectangle(ctx, {
    x,
    y,
    width,
    height: PINLINE_THICKNESS,
    fillStyle: getFillStyle(ctx, getPaletteColors(cardColorTreatment.pinlineColors, palette)),
  });
};
