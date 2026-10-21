import type { Orientation } from '../../../../domain/cards';
import { CARD_LAYOUTS } from '../config';
import type { Palette } from '../../../../domain/colorTreatment';
import { drawRectangle } from '../../common/canvasShapes';
import { drawInkFill, getInkFill } from '../../common/canvasStyles';
import { getPaletteColors, type CardColorTreatment } from '../../../../domain/colorTreatment';
import type { InkLevel } from '../../styles';

// The card background: a panel behind the boxes, like the frame of printed cards
const BACKGROUND_MARGIN = 20;
const BACKGROUND_RADIUS_TOP = 10;
const BACKGROUND_RADIUS_BOTTOM = 55;

/**
 * Draw the card background: a white panel behind the boxes, with no outline,
 * like the pinlines. Black-bordered cards have it on any ink level, inside
 * their black border, and on the high ink level it's filled with the card's
 * colors like the title and type boxes.
 */
export const drawCardBackground = (
  ctx: CanvasRenderingContext2D,
  {
    palette,
    inkLevel,
    blackBordered = false,
    cardColorTreatment,
    orientation = 'portrait',
  }: {
    palette: Palette;
    inkLevel: InkLevel;
    blackBordered?: boolean;
    cardColorTreatment: CardColorTreatment;
    /** Which way the card is drawn: landscape cards (e.g. battles) are laid out sideways */
    orientation?: Orientation;
  },
) => {
  if (!blackBordered && !hasCardBackground(inkLevel)) return;

  const layout = CARD_LAYOUTS[orientation];
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
  if (!hasCardBackground(inkLevel)) return;

  const inkFill = getInkFill(
    ctx,
    getPaletteColors(cardColorTreatment.backgroundColors, palette),
    inkLevel,
    'regular',
    layout,
  );
  if (inkFill) {
    drawInkFill(ctx, inkFill, () => drawRectangle(ctx, { ...panel, fillStyle: inkFill.style }));
  }
};

/**
 * Whether cards have a colored card background at an ink level: on high.
 * On those, the boxes over it are filled lightly.
 */
export const hasCardBackground = (inkLevel: InkLevel): boolean => {
  return inkLevel === 'high';
};
