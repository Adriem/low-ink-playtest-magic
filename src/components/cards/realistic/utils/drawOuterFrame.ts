import type { Orientation } from '../../../../domain/cards';
import { CARD_LAYOUTS, type CardLayout } from '../config';
import type { Palette } from '../../../../domain/colorTreatment';
import { drawRectangle } from '../../common/canvasShapes';
import { drawInkFill, getInkFill } from '../../common/canvasStyles';
import { getPaletteColors, type CardColorTreatment } from '../../../../domain/colorTreatment';
import type { InkLevel } from '../../styles';

const OUTER_BORDER_RADIUS = 20;
const OUTER_BORDER_STROKE = 8;

// The card background: a panel inside the border, behind the boxes, like the
// frame of printed cards
const BACKGROUND_MARGIN = 20;
const BACKGROUND_RADIUS_TOP = 10;
const BACKGROUND_RADIUS_BOTTOM = 55;

/**
 * Draw the border of the card and, on the high and splurge ink levels, the
 * card background inside it, in the card's colors.
 */
export const drawOuterFrame = (
  ctx: CanvasRenderingContext2D,
  {
    palette,
    blackBordered,
    inkLevel = 'low',
    cardColorTreatment,
    orientation = 'portrait',
  }: {
    palette: Palette;
    blackBordered?: boolean;
    inkLevel?: InkLevel;
    cardColorTreatment: CardColorTreatment;
    /** Which way the card is drawn: landscape cards (e.g. battles) are laid out sideways */
    orientation?: Orientation;
  },
) => {
  const layout = CARD_LAYOUTS[orientation];
  drawRectangle(ctx, {
    x: 0,
    y: 0,
    width: layout.width,
    height: layout.height,
    lineWidth: OUTER_BORDER_STROKE,
    strokeStyle: palette.LINE,
    fillStyle: blackBordered ? palette.LINE : palette.PAPER,
    borderRadiusTop: OUTER_BORDER_RADIUS,
  });

  if (hasCardBackground(inkLevel)) {
    drawCardBackground(ctx, { palette, inkLevel, cardColorTreatment, layout });
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
 * Draw the card background: a panel with no outline, like the pinlines,
 * filled with the card's colors like the title and type boxes.
 */
const drawCardBackground = (
  ctx: CanvasRenderingContext2D,
  {
    palette,
    inkLevel,
    cardColorTreatment,
    layout,
  }: { palette: Palette; inkLevel: InkLevel; cardColorTreatment: CardColorTreatment; layout: CardLayout },
) => {
  const panel = {
    x: BACKGROUND_MARGIN,
    y: BACKGROUND_MARGIN,
    width: layout.width - BACKGROUND_MARGIN * 2,
    height: layout.height - BACKGROUND_MARGIN - layout.backgroundMarginBottom,
    lineWidth: 0,
    borderRadiusTop: BACKGROUND_RADIUS_TOP,
    borderRadiusBottom: BACKGROUND_RADIUS_BOTTOM,
  };
  drawRectangle(ctx, { ...panel, fillStyle: palette.PAPER });

  const inkFill = getInkFill(
    ctx,
    getPaletteColors(cardColorTreatment.backgroundColors, palette),
    inkLevel,
    'regular',
    layout,
  );
  if (inkFill) {
    // Over a white panel, so the fill is as light as on white cards on black-bordered ones too
    drawInkFill(ctx, inkFill, () => drawRectangle(ctx, { ...panel, fillStyle: inkFill.style }));
  }
};
