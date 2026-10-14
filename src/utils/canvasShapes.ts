import { fitFontSizeInX } from './canvasText';
import { InkColors } from './colors';

/** A color, gradient or pattern to stroke or fill with */
export type CanvasPaint = CanvasRenderingContext2D['fillStyle'];

export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const drawRectangle = (ctx: CanvasRenderingContext2D, {
  x,
  y,
  width,
  height,
  lineWidth = 0,
  strokeStyle,
  fillStyle,
  borderRadiusTop = 0,
  borderRadiusBottom = borderRadiusTop,
}: Box & {
  lineWidth?: number,
  strokeStyle?: CanvasPaint | null,
  fillStyle?: CanvasPaint | null,
  borderRadiusTop?: number,
  borderRadiusBottom?: number,
}) => {
  ctx.moveTo(x, y);

  ctx.lineWidth = lineWidth;
  if (strokeStyle != null) ctx.strokeStyle = strokeStyle;
  if (fillStyle != null) ctx.fillStyle = fillStyle;

  ctx.beginPath();
  ctx.arc(
    x + lineWidth / 2 + borderRadiusTop,
    y + lineWidth / 2 + borderRadiusTop,
    borderRadiusTop,
    Math.PI,
    1.5 * Math.PI,
  );
  ctx.arc(
    x + width - lineWidth / 2 - borderRadiusTop,
    y + lineWidth / 2 + borderRadiusTop,
    borderRadiusTop,
    1.5 * Math.PI,
    0,
  );
  ctx.arc(
    x + width - lineWidth / 2 - borderRadiusBottom,
    y + height - lineWidth / 2 - borderRadiusBottom,
    borderRadiusBottom,
    0,
    0.5 * Math.PI,
  );
  ctx.arc(
    x + lineWidth / 2 + borderRadiusBottom,
    y + height - lineWidth / 2 - borderRadiusBottom,
    borderRadiusBottom,
    0.5 * Math.PI,
    Math.PI,
  );
  ctx.closePath();

  if (strokeStyle != null) ctx.stroke();
  if (fillStyle != null) ctx.fill();
}

export const drawRoundedBox = (ctx: CanvasRenderingContext2D, {
  x,
  y,
  width,
  height,
  lineWidth = 0,
  strokeStyle = null,
  fillStyle = null,
  flatSide = null,
}: Box & {
  lineWidth?: number,
  strokeStyle?: CanvasPaint | null,
  fillStyle?: CanvasPaint | null,
  flatSide?: 'left' | 'right' | null,
}) => {
  ctx.lineWidth = lineWidth;
  if (strokeStyle != null) ctx.strokeStyle = strokeStyle;
  if (fillStyle != null) ctx.fillStyle = fillStyle;

  const x0 = x + lineWidth / 2;
  const x1 = x + width - lineWidth / 2;

  const y0 = y + lineWidth / 2;
  const y1 = y + height + lineWidth / 2;

  const rx = height / 4;
  const ry = height / 2;

  ctx.beginPath();

  if (flatSide === 'left') {
    ctx.moveTo(x0, y1);
    ctx.lineTo(x0, y0);
  } else {
    ctx.ellipse(
      x0 + rx,
      y0 + ry,
      rx,
      ry,
      0,
      0.5 * Math.PI,
      1.5 * Math.PI,
    );
  }

  if (flatSide === 'right') {
    ctx.lineTo(x1, y0);
    ctx.lineTo(x1, y1);
  } else {  
    ctx.ellipse(
      x1 - rx,
      y0 + ry,
      rx,
      ry,
      0,
      1.5 * Math.PI,
      0.5 * Math.PI,
    );
  }

  ctx.closePath();

  if (fillStyle != null) ctx.fill();
  if (strokeStyle != null) ctx.stroke();
};

// Loyalty cost shapes: an arrow pointing up (+), down (-) or a flat badge (0),
// drawn as two arcs around the cost. Offsets are from the shape's anchor
// (the arrow tip), angles are in multiples of PI.
type LoyaltyCostArc = [side: 'left' | 'right', startAngle: number, endAngle: number];

interface LoyaltyCostShape {
  anchorOffsetY: number;
  arcOffsetY: number;
  innerTipOffsetY: number;
  textOffsetY: number;
  fitText: boolean;
  outerArcs: LoyaltyCostArc[];
  innerArcs: LoyaltyCostArc[];
}

const LOYALTY_COST_SHAPES: Record<'plus' | 'minus' | 'zero', LoyaltyCostShape> = {
  plus: {
    anchorOffsetY: -18,
    arcOffsetY: 21,
    innerTipOffsetY: 6,
    textOffsetY: 28,
    fitText: true,
    outerArcs: [['right', 1.135, 0.795], ['left', 0.205, 1.855]],
    innerArcs: [['right', 1.09, 0.875], ['left', 0.125, 1.91]],
  },
  minus: {
    anchorOffsetY: 18,
    arcOffsetY: -21,
    innerTipOffsetY: -6,
    textOffsetY: -14,
    fitText: true,
    outerArcs: [['left', 0.125, 1.775], ['right', 1.215, 0.875]],
    innerArcs: [['left', 0.085, 1.87], ['right', 1.13, 0.915]],
  },
  zero: {
    anchorOffsetY: 14,
    arcOffsetY: -15,
    innerTipOffsetY: -5,
    textOffsetY: -7,
    fitText: false,
    outerArcs: [['left', 0.225, 1.775], ['right', 1.215, 0.775]],
    innerArcs: [['left', 0.125, 1.87], ['right', 1.13, 0.875]],
  },
};

/**
 * Trace the arcs of a loyalty cost shape. The inner (white) arcs are 1px
 * closer to the center and 3px wider.
 */
const traceLoyaltyCostArcs = (
  ctx: CanvasRenderingContext2D,
  arcs: LoyaltyCostArc[],
  { x, arcY, scale, isInner }: { x: number, arcY: number, scale: number, isInner: boolean },
) => {
  for (const [side, startAngle, endAngle] of arcs) {
    const centerX = side === 'left'
      ? x - (47 * scale) + (isInner ? scale : 0)
      : x + (46 * scale) - (isInner ? scale : 0);
    const radius = (23 * scale) + (isInner ? (3 * scale) : 0);

    ctx.arc(centerX, arcY, radius, startAngle * Math.PI, endAngle * Math.PI, true);
  }
};

/**
 * Draw the cost of a planeswalker's loyalty ability, e.g. `+1`, `-3` or `0`.
 */
export const drawLoyaltyCost = (ctx: CanvasRenderingContext2D, {
  loyaltyCost,
  x,
  y,
  scale = 1,
  fontFamily,
  fontSize = 22,
}: { loyaltyCost: string, x: number, y: number, scale?: number, fontFamily: string, fontSize?: number }) => {
  const shape = loyaltyCost.startsWith('+')
    ? LOYALTY_COST_SHAPES.plus
    : loyaltyCost === '0'
      ? LOYALTY_COST_SHAPES.zero
      : LOYALTY_COST_SHAPES.minus;

  const anchorY = y + shape.anchorOffsetY;
  const arcY = anchorY + (shape.arcOffsetY * scale);

  ctx.fillStyle = InkColors.LINE;
  ctx.beginPath();
  ctx.moveTo(x, anchorY);
  traceLoyaltyCostArcs(ctx, shape.outerArcs, { x, arcY, scale, isInner: false });
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = InkColors.PAPER;
  ctx.beginPath();
  ctx.moveTo(x, anchorY + (shape.innerTipOffsetY * scale));
  traceLoyaltyCostArcs(ctx, shape.innerArcs, { x, arcY, scale, isInner: true });
  ctx.closePath();
  ctx.fill();

  ctx.font = `bold ${fontSize * scale}px ${fontFamily}`;
  ctx.fillStyle = InkColors.TEXT;
  ctx.textAlign = 'center';
  if (shape.fitText) fitFontSizeInX(ctx, loyaltyCost, 30 * scale);
  ctx.fillText(loyaltyCost, x, anchorY + (shape.textOffsetY * scale));
};

export const drawLoyaltyBox = (ctx: CanvasRenderingContext2D, {
  cardLoyalty,
  x,
  y,
  scale = 1,
  fontFamily,
}: { cardLoyalty: string, x: number, y: number, scale?: number, fontFamily: string }) => {
  const leftArcProps = { x: x - (61 * scale), y: y - (19 * scale), radius: (29 * scale) };
  const topArcProps = { x, y: y - (52 * scale), radius: (11 * scale) };
  const rightArcProps = { x: x + (60 * scale), y: y - (19 * scale), radius: (29 * scale) };

  ctx.fillStyle = InkColors.LINE;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(leftArcProps.x, leftArcProps.y, leftArcProps.radius, 0.075 * Math.PI, 1.765 * Math.PI, true);
  ctx.arc(topArcProps.x, topArcProps.y, topArcProps.radius, 0.90 * Math.PI, 0.1 * Math.PI, true);
  ctx.arc(rightArcProps.x, rightArcProps.y, rightArcProps.radius, 1.225 * Math.PI, 0.925 * Math.PI, true);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = InkColors.PAPER;
  ctx.beginPath();
  ctx.moveTo(x, y - (5 * scale));
  ctx.arc(leftArcProps.x + scale, leftArcProps.y, leftArcProps.radius + (3 * scale), 0.045 * Math.PI, 1.82 * Math.PI, true);
  ctx.arc(topArcProps.x, topArcProps.y + scale, topArcProps.radius + (4 * scale), 0.825 * Math.PI, 0.175 * Math.PI, true);
  ctx.arc(rightArcProps.x - scale, rightArcProps.y, rightArcProps.radius + (3 * scale), 1.18 * Math.PI, 0.955 * Math.PI, true);
  ctx.closePath();
  ctx.fill();

  const fontSize = 27 * scale;

  ctx.font = `bold ${fontSize}px ${fontFamily}`;
  ctx.fillStyle = InkColors.TEXT;
  ctx.textAlign = 'center';
  ctx.fillText(cardLoyalty, x, y - (12 * scale));
};

const traceHexagonPath = (ctx: CanvasRenderingContext2D, { x, y, radius }: { x: number, y: number, radius: number }) => {
  const horizontalHalf = radius * Math.sqrt(3) / 2;
  const verticalHalf = radius / 2;

  ctx.beginPath();
  ctx.moveTo(x, y - radius);
  ctx.lineTo(x + horizontalHalf, y - verticalHalf);
  ctx.lineTo(x + horizontalHalf, y + verticalHalf);
  ctx.lineTo(x, y + radius);
  ctx.lineTo(x - horizontalHalf, y + verticalHalf);
  ctx.lineTo(x - horizontalHalf, y - verticalHalf);
  ctx.closePath();
};

export const drawSagaChapter = (ctx: CanvasRenderingContext2D, {
  romanNumeral,
  x,
  y,
  scale = 1,
  fontFamily,
  fontSize = 17.5,
}: { romanNumeral: string, x: number, y: number, scale?: number, fontFamily: string, fontSize?: number }) => {
  const outerRadius = 22.5 * scale;
  const innerRadius = outerRadius - 3.75 * scale;

  ctx.fillStyle = InkColors.LINE;
  traceHexagonPath(ctx, { x, y, radius: outerRadius });
  ctx.fill();

  ctx.fillStyle = InkColors.PAPER;
  traceHexagonPath(ctx, { x, y, radius: innerRadius });
  ctx.fill();

  const previousTextAlign = ctx.textAlign;
  const previousTextBaseline = ctx.textBaseline;
  const previousFont = ctx.font;

  ctx.font = `bold ${fontSize * scale}px ${fontFamily}`;
  ctx.fillStyle = InkColors.TEXT;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(romanNumeral, x, y + 1.25 * scale);

  ctx.textAlign = previousTextAlign;
  ctx.textBaseline = previousTextBaseline;
  ctx.font = previousFont;
};

