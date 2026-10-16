import { drawRectangle } from '../../common/canvasShapes';
import { MINIMALIST_PALETTE } from '../palette';

export const drawOuterFrame = (ctx: CanvasRenderingContext2D, { blackBordered }: { blackBordered?: boolean }) => {
  const OUTER_BORDER_RADIUS = 0;
  const OUTER_BORDER_STROKE = 8;

  drawRectangle(ctx, {
    x: 0,
    y: 0,
    width: ctx.canvas.width,
    height: ctx.canvas.height,
    lineWidth: OUTER_BORDER_STROKE,
    strokeStyle: MINIMALIST_PALETTE.LINE,
    fillStyle: blackBordered ? MINIMALIST_PALETTE.LINE : MINIMALIST_PALETTE.PAPER,
    borderRadiusTop: OUTER_BORDER_RADIUS,
  });
};
