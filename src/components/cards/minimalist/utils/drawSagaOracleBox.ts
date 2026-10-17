import { drawRectangle, drawSagaChapter } from '../../common/canvasShapes';
import { getFontSize } from '../../common/canvasText';
import { fillMultilineText, fitOracleLinesIntoBox, getOracleTextLength } from '../../common/oracleTextRenderer';
import { distributeHeight } from '../../../../utils/layout';
import {
  CONTENT_WIDTH,
  DISPLAY_FONT_FAMILY,
  ORACLE_FONT_SIZE,
  ORACLE_HEIGHT,
  ORACLE_Y,
  PINLINE_THICKNESS,
  SAGA_ORACLE_EXTENDED_EXTRA,
  SIDE_BORDER_PADDING,
  SIDE_BORDER_WIDTH,
} from '../config';
import { getSideBorderEdges } from './sideBorder';
import { MINIMALIST_PALETTE } from '../palette';
import { getPaletteColors, type ColorTreatment } from '../../../../domain/colorTreatment';
import { getFillStyle } from '../../common/canvasStyles';
import { getSagaParts, type OracleLine, type OracleText } from '../../../../domain/oracleText';

const SAGA_CHAPTER_ICON_SPACING = 50;
const SAGA_TEXT_LEFT_OFFSET = 36;
const SAGA_CHAPTER_DIVIDER_HEIGHT = 1;
// Space between the side border and the text next to it
const SIDE_BORDER_TEXT_GAP = 8;
// Minimum height of each line and chapter of the saga's text
const MIN_SLOT_HEIGHT = 75;
// Height of a hexagon chapter icon (at scale 1)
const CHAPTER_ICON_HEIGHT = 45;

/** A line or chapter of a saga's text, and where it's drawn */
interface SagaSlot {
  line: OracleLine;
  leftX: number;
  width: number;
  align?: 'top' | 'center';
  /** The chapter's numbers */
  labels?: string[];
  isChapter?: boolean;
  /** Lines after the chapters are centered */
  isBottom?: boolean;
}

export const drawSagaOracleBox = (
  ctx: CanvasRenderingContext2D,
  {
    cardOracleText = { lines: [] },
    cardColorTreatment,
    cardPower,
    cardToughness,
  }: { cardOracleText?: OracleText; cardColorTreatment: ColorTreatment; cardPower?: string; cardToughness?: string },
) => {
  const hasStats = cardPower != null && cardToughness != null;

  const x = (ctx.canvas.width - CONTENT_WIDTH) / 2;
  const y = ORACLE_Y;
  const height = hasStats ? ORACLE_HEIGHT : ORACLE_HEIGHT + SAGA_ORACLE_EXTENDED_EXTRA;

  const textPaddingTop = 15;
  const textX = x;
  const textWidth = CONTENT_WIDTH;
  const textY = y + textPaddingTop;
  const textHeight = height - textPaddingTop;

  const { sagaAbilities, chapters, creatureAbilities } = getSagaParts(cardOracleText);

  const contentLeftX = textX + SIDE_BORDER_PADDING;
  const contentWidth = textWidth - SIDE_BORDER_PADDING - SIDE_BORDER_WIDTH * 1.5;
  const chapterTextX = contentLeftX + SAGA_TEXT_LEFT_OFFSET;
  const chapterTextWidth = contentWidth - SAGA_TEXT_LEFT_OFFSET;
  const borderCenterX = textX + SIDE_BORDER_PADDING - SIDE_BORDER_WIDTH * 0.15;

  const dividerLeftX = textX + SIDE_BORDER_PADDING + SIDE_BORDER_WIDTH * 0.35 + 1;
  // Lines before the chapters start after the side border, so they don't overlap it
  const sagaAbilitiesX = getSideBorderEdges(textX).right + SIDE_BORDER_TEXT_GAP;
  const dividerWidth = contentLeftX + contentWidth - dividerLeftX;

  // The lines before the chapters (e.g. reminder text), each chapter and the
  // lines after them get a slot as tall as their share of the
  // characters (including spaces), but at least the minimum height and tall
  // enough for a chapter's icons, like printed sagas
  const slots: SagaSlot[] = [
    ...sagaAbilities.map((line) => ({
      line,
      leftX: sagaAbilitiesX,
      width: contentLeftX + contentWidth - sagaAbilitiesX,
      align: 'top' as const,
    })),
    ...chapters.map((chapter) => ({
      line: chapter,
      labels: chapter.chapterNumbers,
      leftX: chapterTextX,
      width: chapterTextWidth,
      isChapter: true,
    })),
    ...creatureAbilities.map((line) => ({
      line,
      leftX: textX + textWidth / 2,
      width: contentWidth,
      isBottom: true,
    })),
  ];
  const slotHeights = distributeHeight(
    textHeight,
    slots.map(({ line, labels }) => ({
      weight: getOracleTextLength([line]),
      minHeight: Math.max(MIN_SLOT_HEIGHT, (labels?.length ?? 0) * SAGA_CHAPTER_ICON_SPACING),
      // When the minimums don't fit, slots get the same height, except that a
      // chapter still needs room for its icons
      requiredHeight: labels ? (labels.length - 1) * SAGA_CHAPTER_ICON_SPACING + CHAPTER_ICON_HEIGHT : 0,
    })),
  );

  const borderTopY = y;
  const chaptersEndY =
    textY +
    slotHeights.slice(0, sagaAbilities.length + chapters.length).reduce((sum, slotHeight) => sum + slotHeight, 0);
  const borderHeight = creatureAbilities.length > 0 ? chaptersEndY - borderTopY : height + 10;
  drawSagaOracleBorder(ctx, { cardColorTreatment, x: textX, y: borderTopY, height: borderHeight });

  // All the slots use the same font size: the largest at which every slot's text fits
  const fitParagraph = (line: OracleLine, width: number, slotHeight: number, fontSize: number) => {
    ctx.font = `${fontSize}px ${DISPLAY_FONT_FAMILY}`;
    return fitOracleLinesIntoBox(ctx, [line], width, slotHeight);
  };
  const fontSize = Math.min(
    ...slots.map(({ line, width }, index) => {
      fitParagraph(line, width, slotHeights[index], ORACLE_FONT_SIZE);
      return getFontSize(ctx);
    }),
  );

  ctx.fillStyle = MINIMALIST_PALETTE.TEXT;

  let currentY = textY;
  slots.forEach(({ line, labels, leftX, width, align = 'center', isChapter, isBottom }, index) => {
    const slotY = currentY;
    const slotHeight = slotHeights[index];

    ctx.textAlign = isBottom ? 'center' : 'start';
    const fitted = fitParagraph(line, width, slotHeight, fontSize);
    const totalTextHeight = fitted.reduce((sum, p) => sum + p.paragraphHeight, 0);
    let paragraphY =
      align === 'top'
        ? slotY + ORACLE_FONT_SIZE * 0.7
        : slotY + slotHeight / 2 - totalTextHeight / 2 + ORACLE_FONT_SIZE * 0.7;
    for (const paragraph of fitted) {
      fillMultilineText(ctx, paragraph.lines, leftX, paragraphY);
      paragraphY += paragraph.paragraphHeight;
    }

    if (labels) {
      const iconBlockHeight = (labels.length - 1) * SAGA_CHAPTER_ICON_SPACING;
      const firstIconY = slotY + slotHeight / 2 - iconBlockHeight / 2;

      labels.forEach((label, labelIndex) => {
        drawSagaChapter(ctx, {
          romanNumeral: label,
          x: borderCenterX,
          y: firstIconY + labelIndex * SAGA_CHAPTER_ICON_SPACING,
          fontFamily: DISPLAY_FONT_FAMILY,
          colors: MINIMALIST_PALETTE,
        });
      });
    }

    // Line between this slot and the next one, when either is a chapter
    const nextSlot = slots[index + 1];
    if (nextSlot && (isChapter || nextSlot.isChapter)) {
      drawRectangle(ctx, {
        x: dividerLeftX,
        y: slotY + slotHeight - SAGA_CHAPTER_DIVIDER_HEIGHT / 2,
        width: dividerWidth,
        height: SAGA_CHAPTER_DIVIDER_HEIGHT,
        fillStyle: MINIMALIST_PALETTE.LINE,
      });
    }

    currentY += slotHeight;
  });
  ctx.textAlign = 'start';

  if (hasStats) {
    drawRectangle(ctx, {
      x: textX,
      y: y + height,
      width: textWidth,
      height: PINLINE_THICKNESS,
      fillStyle: getFillStyle(ctx, getPaletteColors(cardColorTreatment, MINIMALIST_PALETTE)),
    });
  }
};

const drawSagaOracleBorder = (
  ctx: CanvasRenderingContext2D,
  { cardColorTreatment, x, y, height }: { cardColorTreatment: ColorTreatment; x: number; y: number; height: number },
) => {
  ctx.fillStyle = getFillStyle(ctx, getPaletteColors(cardColorTreatment, MINIMALIST_PALETTE));

  const { left: xOffsetL, right: xOffsetR } = getSideBorderEdges(x);
  const tipX = (xOffsetL + xOffsetR) / 2;
  const tipHeight = 16;

  ctx.beginPath();
  ctx.moveTo(xOffsetL, y);
  ctx.lineTo(xOffsetR, y);
  ctx.lineTo(xOffsetR, y + height - tipHeight);
  ctx.lineTo(tipX, y + height);
  ctx.lineTo(xOffsetL, y + height - tipHeight);
  ctx.closePath();

  ctx.fill();
};
