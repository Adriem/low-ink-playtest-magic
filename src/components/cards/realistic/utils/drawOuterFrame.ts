import { drawRectangle } from '../../common/canvasShapes';
import { REALISTIC_PALETTE } from '../palette';

export const drawOuterFrame = (ctx: CanvasRenderingContext2D, { blackBordered }: { blackBordered?: boolean }) => {
  const OUTER_BORDER_RADIUS = 20;
  const OUTER_BORDER_STROKE = 8;

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
};
