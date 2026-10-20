import { drawRectangle } from '../../common/canvasShapes';
import type { MinimalistPalette } from '../palette';

const OUTER_BORDER_STROKE = 8;
// Width of the black border, around the white area where the card is drawn
const BLACK_BORDER_WIDTH = 12;
const BLACK_BORDER_INNER_RADIUS = 8;

export const drawOuterFrame = (
  ctx: CanvasRenderingContext2D,
  { palette, blackBordered }: { palette: MinimalistPalette; blackBordered?: boolean },
) => {
  drawRectangle(ctx, {
    x: 0,
    y: 0,
    width: ctx.canvas.width,
    height: ctx.canvas.height,
    lineWidth: OUTER_BORDER_STROKE,
    strokeStyle: palette.LINE,
    fillStyle: blackBordered ? palette.LINE : palette.PAPER,
  });

  if (blackBordered) {
    drawRectangle(ctx, {
      x: BLACK_BORDER_WIDTH,
      y: BLACK_BORDER_WIDTH,
      width: ctx.canvas.width - BLACK_BORDER_WIDTH * 2,
      height: ctx.canvas.height - BLACK_BORDER_WIDTH * 2,
      lineWidth: 0,
      fillStyle: palette.PAPER,
      borderRadiusTop: BLACK_BORDER_INNER_RADIUS,
    });
  }
};
