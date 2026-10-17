import { drawRectangle } from '../../common/canvasShapes';
import { MINIMALIST_PALETTE } from '../palette';

const OUTER_BORDER_STROKE = 8;
// Width of the black border, around the white area where the card is drawn
const BLACK_BORDER_WIDTH = 12;
const BLACK_BORDER_INNER_RADIUS = 8;

export const drawOuterFrame = (ctx: CanvasRenderingContext2D, { blackBordered }: { blackBordered?: boolean }) => {
  drawRectangle(ctx, {
    x: 0,
    y: 0,
    width: ctx.canvas.width,
    height: ctx.canvas.height,
    lineWidth: OUTER_BORDER_STROKE,
    strokeStyle: MINIMALIST_PALETTE.LINE,
    fillStyle: blackBordered ? MINIMALIST_PALETTE.LINE : MINIMALIST_PALETTE.PAPER,
  });

  if (blackBordered) {
    drawRectangle(ctx, {
      x: BLACK_BORDER_WIDTH,
      y: BLACK_BORDER_WIDTH,
      width: ctx.canvas.width - BLACK_BORDER_WIDTH * 2,
      height: ctx.canvas.height - BLACK_BORDER_WIDTH * 2,
      lineWidth: 0,
      fillStyle: MINIMALIST_PALETTE.PAPER,
      borderRadiusTop: BLACK_BORDER_INNER_RADIUS,
    });
  }
};
