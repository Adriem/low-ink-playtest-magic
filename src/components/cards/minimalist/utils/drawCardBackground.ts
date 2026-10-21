import { drawRectangle } from '../../common/canvasShapes';
import type { MinimalistPalette } from '../palette';

// A panel where the card is drawn, leaving a black edge of the canvas around it
const PANEL_MARGIN = 12;
const PANEL_RADIUS = 8;

/**
 * Draw the card background of black-bordered cards, whose canvas is black: a
 * white panel where the card is drawn, so its black text stays readable.
 */
export const drawCardBackground = (ctx: CanvasRenderingContext2D, { palette }: { palette: MinimalistPalette }) => {
  drawRectangle(ctx, {
    x: PANEL_MARGIN,
    y: PANEL_MARGIN,
    width: ctx.canvas.width - PANEL_MARGIN * 2,
    height: ctx.canvas.height - PANEL_MARGIN * 2,
    fillStyle: palette.PAPER,
    borderRadiusTop: PANEL_RADIUS,
  });
};
