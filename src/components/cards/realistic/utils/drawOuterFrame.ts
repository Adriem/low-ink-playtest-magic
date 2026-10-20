import { drawRectangle } from '../../common/canvasShapes';
import { drawInkFill, getInkFill } from '../../common/canvasStyles';
import { getPaletteColors, type CardColorTreatment } from '../../../../domain/colorTreatment';
import { REALISTIC_PALETTE } from '../palette';
import type { InkLevel } from '../../styles';

const OUTER_BORDER_RADIUS = 20;
const OUTER_BORDER_STROKE = 8;

// The card background: a panel inside the border, behind the boxes, like the
// frame of printed cards
const BACKGROUND_MARGIN = 20;
const BACKGROUND_MARGIN_BOTTOM = 50;
const BACKGROUND_RADIUS_TOP = 10;
const BACKGROUND_RADIUS_BOTTOM = 70;
const BACKGROUND_STROKE = 4;

/**
 * Draw the border of the card and, on the high and splurge ink levels, the
 * card background inside it, in the card's colors.
 */
export const drawOuterFrame = (
  ctx: CanvasRenderingContext2D,
  {
    blackBordered,
    inkLevel = 'low',
    cardColorTreatment,
  }: { blackBordered?: boolean; inkLevel?: InkLevel; cardColorTreatment: CardColorTreatment },
) => {
  drawRectangle(ctx, {
    x: 0,
    y: 0,
    width: ctx.canvas.width,
    height: ctx.canvas.height,
    lineWidth: OUTER_BORDER_STROKE,
    strokeStyle: REALISTIC_PALETTE.LINE,
    fillStyle: blackBordered ? REALISTIC_PALETTE.LINE : REALISTIC_PALETTE.PAPER,
    borderRadiusTop: OUTER_BORDER_RADIUS,
  });

  if (hasCardBackground(inkLevel)) {
    drawCardBackground(ctx, { inkLevel, cardColorTreatment });
  }
};

/**
 * Whether cards have a card background at an ink level: on high and splurge.
 * On those, the boxes over it are filled lightly.
 */
export const hasCardBackground = (inkLevel: InkLevel): boolean => {
  return inkLevel === 'high' || inkLevel === 'splurge';
};

/**
 * Draw the card background: a white panel with a dark outline, filled with
 * the card's colors like the title and type boxes.
 */
const drawCardBackground = (
  ctx: CanvasRenderingContext2D,
  { inkLevel, cardColorTreatment }: { inkLevel: InkLevel; cardColorTreatment: CardColorTreatment },
) => {
  const panel = {
    x: BACKGROUND_MARGIN,
    y: BACKGROUND_MARGIN,
    width: ctx.canvas.width - BACKGROUND_MARGIN * 2,
    height: ctx.canvas.height - BACKGROUND_MARGIN - BACKGROUND_MARGIN_BOTTOM,
    lineWidth: BACKGROUND_STROKE,
    borderRadiusTop: BACKGROUND_RADIUS_TOP,
    borderRadiusBottom: BACKGROUND_RADIUS_BOTTOM,
  };
  drawRectangle(ctx, { ...panel, strokeStyle: REALISTIC_PALETTE.LINE, fillStyle: REALISTIC_PALETTE.PAPER });

  const inkFill = getInkFill(ctx, getPaletteColors(cardColorTreatment.backgroundColors, REALISTIC_PALETTE), inkLevel);
  if (inkFill) {
    // Filled where the panel is white, so the fill doesn't cover its outline
    drawInkFill(ctx, inkFill, () => drawRectangle(ctx, { ...panel, fillStyle: inkFill.style }));
  }
};
