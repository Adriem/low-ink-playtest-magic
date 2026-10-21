/** Radius of the rounded corners of a card, on its 500x700 canvas */
const CORNER_RADIUS = 20;
/** Width of the outline over the edges of a card, on its 500x700 canvas */
const OUTLINE_WIDTH = 4;

/** How the edges of a card are drawn */
export interface CardFrame {
  /** With a line over its edges */
  outlined?: boolean;
  /** With rounded corners, transparent outside them */
  roundedCorners?: boolean;
}

/**
 * Draw the frame of a card on its finished canvas: cut its corners round,
 * leaving them transparent, and draw its outline. Its drawings that are still
 * loading (e.g. art) don't reach its edges, so they don't cover it.
 *
 * @param color - Color of the outline
 */
export const drawCardFrame = (
  ctx: CanvasRenderingContext2D,
  { outlined, roundedCorners }: CardFrame,
  color: string,
) => {
  const radius = roundedCorners ? CORNER_RADIUS : 0;

  ctx.save();
  ctx.resetTransform();
  if (roundedCorners) {
    ctx.globalCompositeOperation = 'destination-in';
    traceCard(ctx, radius);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  }
  if (outlined) {
    // A stroke on the card's edges, twice as wide, clipped to its inside half
    traceCard(ctx, radius);
    ctx.clip();
    ctx.strokeStyle = color;
    ctx.lineWidth = OUTLINE_WIDTH * 2;
    ctx.stroke();
  }
  ctx.restore();
};

/**
 * Trace the outline of the card filling a canvas.
 */
const traceCard = (ctx: CanvasRenderingContext2D, radius: number) => {
  ctx.beginPath();
  ctx.roundRect(0, 0, ctx.canvas.width, ctx.canvas.height, radius);
};
