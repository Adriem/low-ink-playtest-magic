import { drawRectangle } from '../../../utils/canvasShapes';
import { InkColors } from '../../../utils/colors';

export const drawOuterFrame = (ctx, { blackBordered }) => {
  const OUTER_BORDER_RADIUS = 0;
  const OUTER_BORDER_STROKE = 8;

  drawRectangle(ctx, {
    x: 0,
    y: 0,
    width: ctx.canvas.width,
    height: ctx.canvas.height,
    lineWidth: OUTER_BORDER_STROKE,
    strokeStyle: InkColors.LINE,
    fillStyle: blackBordered ? InkColors.LINE : InkColors.PAPER,
    borderRadiusTop: OUTER_BORDER_RADIUS,
  });
};
