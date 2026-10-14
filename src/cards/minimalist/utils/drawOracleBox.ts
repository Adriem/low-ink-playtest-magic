import { drawRectangle } from '../../../utils/canvasShapes';
import { getColorIdentityStyle } from '../../../utils/canvasStyles';
import { fillMultilineText, fitTextIntoBox } from '../../../utils/canvasText';
import { CONTENT_WIDTH, ORACLE_EXTENDED_EXTRA, ORACLE_FONT_SIZE, ORACLE_HEIGHT, ORACLE_TEXT_PADDING_TOP, ORACLE_Y, PINLINE_THICKNESS, TEXT_FONT_FAMILY } from '../config';
import { InkColors, type ColorIdentity } from '../../../utils/colors';
import type { OracleLayout } from '../../styles';

const DIVIDER_TEXT_PADDING = 8;

const drawSubCardDivider = (ctx: CanvasRenderingContext2D, { cardColorIdentity, height }: { cardColorIdentity?: ColorIdentity, height: number }) => {
  drawRectangle(ctx, {
    x: (ctx.canvas.width - PINLINE_THICKNESS) / 2,
    y: ORACLE_Y,
    width: PINLINE_THICKNESS,
    height: height,
    fillStyle: getColorIdentityStyle(ctx, cardColorIdentity),
  });
};

const drawOracleBorder = (ctx: CanvasRenderingContext2D, { cardColorIdentity, layout, y }: { cardColorIdentity?: ColorIdentity, layout: OracleLayout, y: number }) => {
  const x = layout === 'right-half'
    ? ctx.canvas.width / 2 - PINLINE_THICKNESS / 2
    : (ctx.canvas.width - CONTENT_WIDTH) / 2;
  const width = layout === 'full-width'
    ? CONTENT_WIDTH
    : CONTENT_WIDTH / 2 + PINLINE_THICKNESS / 2;

  drawRectangle(ctx, {
    x,
    y,
    width,
    height: PINLINE_THICKNESS,
    fillStyle: getColorIdentityStyle(ctx, cardColorIdentity),
  });
};

export const drawOracleBox = (ctx: CanvasRenderingContext2D, {
  cardOracleText,
  cardColorIdentity,
  cardPower,
  cardToughness,
  layout,
}: { cardOracleText?: string, cardColorIdentity?: ColorIdentity, cardPower?: string, cardToughness?: string, layout: OracleLayout }) => {
  const hasStats = cardPower != null && cardToughness != null;

  const x = layout === 'right-half'
    ? ctx.canvas.width / 2 + PINLINE_THICKNESS / 2
    : (ctx.canvas.width - CONTENT_WIDTH) / 2;
  const y = ORACLE_Y;
  const width = layout === 'full-width'
    ? CONTENT_WIDTH
    : (CONTENT_WIDTH - PINLINE_THICKNESS) / 2;
  const height = hasStats ? ORACLE_HEIGHT : ORACLE_HEIGHT + ORACLE_EXTENDED_EXTRA;

  if (layout !== 'full-width') {
    drawSubCardDivider(ctx, { cardColorIdentity, height });
  }
  drawOracleBorder(ctx, { cardColorIdentity, layout, y: y + height });

  const textPaddingX = layout === 'full-width' ? 0 : DIVIDER_TEXT_PADDING;
  const textX = layout === 'right-half' ? x + textPaddingX : x;
  const textWidth = width - textPaddingX;

  const textPaddingTop = ORACLE_TEXT_PADDING_TOP;
  const textPaddingBottom = 0;
  const textY = y + textPaddingTop;
  const textHeight = height - textPaddingTop - textPaddingBottom;

  ctx.font = `${ORACLE_FONT_SIZE}px ${TEXT_FONT_FAMILY}`;
  ctx.fillStyle = InkColors.TEXT;
  ctx.textAlign = 'start';

  const paragraphs = fitTextIntoBox(
    ctx,
    (cardOracleText ?? '').split('\n').map(content => ({ content, width: textWidth })),
    textHeight,
  );

  let currentY = textY;
  for (const paragraph of paragraphs) {
    fillMultilineText(ctx, paragraph.lines, textX, currentY);
    currentY += paragraph.paragraphHeight;
  }
};
