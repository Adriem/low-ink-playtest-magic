import { fitFontSizeInX } from './canvasText';

export const drawRectangle = (ctx, {
  x,
  y,
  width,
  height,
  lineWidth = 0,
  strokeStyle,
  fillStyle,
  borderRadiusTop = 0,
  borderRadiusBottom = borderRadiusTop,
}) => {
  ctx.moveTo(x, y);

  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = strokeStyle;
  ctx.fillStyle = fillStyle;

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

export const drawRoundedBox = (ctx, {
  x,
  y,
  width,
  height,
  lineWidth = 0,
  strokeStyle = null,
  fillStyle = null,
  flatSide = null,
}) => {
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = strokeStyle;
  ctx.fillStyle = fillStyle;

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

export const drawLoyaltyPlus = (ctx, {
  loyaltyCost,
  x,
  y,
  scale = 1,
  fontFamily = 'Serif',
  fontSize = 22,
}) => {
  const topY = y - 18

  const leftArcProps = { x: x - (47 * scale), y: topY + (21 * scale), radius: (23 * scale) };
  const rightArcProps = { x: x + (46 * scale), y: topY + (21 * scale), radius: (23 * scale) };

  ctx.fillStyle = 'black';
  ctx.beginPath();
  ctx.moveTo(x, topY);
  ctx.arc(rightArcProps.x, rightArcProps.y, rightArcProps.radius, 1.135 * Math.PI, 0.795 * Math.PI, true);
  ctx.arc(leftArcProps.x, leftArcProps.y, leftArcProps.radius, 0.205 * Math.PI, 1.855 * Math.PI, true);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.moveTo(x, topY + (6 * scale));
  ctx.arc(rightArcProps.x - scale, rightArcProps.y, rightArcProps.radius + (3 * scale), 1.09 * Math.PI, 0.875 * Math.PI, true);
  ctx.arc(leftArcProps.x + scale, leftArcProps.y, leftArcProps.radius + (3 * scale), 0.125 * Math.PI, 1.91 * Math.PI, true);
  ctx.closePath();
  ctx.fill();

  ctx.font = `bold ${fontSize * scale}px ${fontFamily}`;
  ctx.fillStyle = 'black';
  ctx.textAlign = 'center';
  fitFontSizeInX(ctx, loyaltyCost, 30 * scale)
  ctx.fillText(loyaltyCost, x, topY + (28 * scale));
};

export const drawLoyaltyMinus = (ctx, {
  loyaltyCost,
  x,
  y,
  scale = 1,
  fontFamily = 'Serif',
  fontSize = 22,
}) => {
  const bottomY = y + 18

  const leftArcProps = { x: x - (47 * scale), y: bottomY - (21 * scale), radius: (23 * scale) };
  const rightArcProps = { x: x + (46 * scale), y: bottomY - (21 * scale), radius: (23 * scale) };

  ctx.fillStyle = 'black';
  ctx.beginPath();
  ctx.moveTo(x, bottomY);
  ctx.arc(leftArcProps.x, leftArcProps.y, leftArcProps.radius, 0.125 * Math.PI, 1.775 * Math.PI, true);
  ctx.arc(rightArcProps.x, rightArcProps.y, rightArcProps.radius, 1.215 * Math.PI, 0.875 * Math.PI, true);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.moveTo(x, bottomY - (6 * scale));
  ctx.arc(leftArcProps.x + scale, leftArcProps.y, leftArcProps.radius + (3 * scale), 0.085 * Math.PI, 1.87 * Math.PI, true);
  ctx.arc(rightArcProps.x - scale, rightArcProps.y, rightArcProps.radius + (3 * scale), 1.13 * Math.PI, 0.915 * Math.PI, true);
  ctx.closePath();
  ctx.fill();

  ctx.font = `bold ${fontSize * scale}px ${fontFamily}`;
  ctx.fillStyle = 'black';
  ctx.textAlign = 'center';
  fitFontSizeInX(ctx, loyaltyCost, 30 * scale)
  ctx.fillText(loyaltyCost, x, bottomY - (14 * scale));
};

export const drawLoyaltyZero = (ctx, {
  loyaltyCost = 0,
  x,
  y,
  scale = 1,
  fontFamily = 'Serif',
  fontSize = 22,
}) => {
  const bottomY = y + 14

  const leftArcProps = { x: x - (47 * scale), y: bottomY - (15 * scale), radius: (23 * scale) };
  const rightArcProps = { x: x + (46 * scale), y: bottomY - (15 * scale), radius: (23 * scale) };

  ctx.fillStyle = 'black';
  ctx.beginPath();
  ctx.moveTo(x, bottomY);
  ctx.arc(leftArcProps.x, leftArcProps.y, leftArcProps.radius, 0.225 * Math.PI, 1.775 * Math.PI, true);
  ctx.arc(rightArcProps.x, rightArcProps.y, rightArcProps.radius, 1.215 * Math.PI, 0.775 * Math.PI, true);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.moveTo(x, bottomY - (5 * scale));
  ctx.arc(leftArcProps.x + scale, leftArcProps.y, leftArcProps.radius + (3 * scale), 0.125 * Math.PI, 1.87 * Math.PI, true);
  ctx.arc(rightArcProps.x - scale, rightArcProps.y, rightArcProps.radius + (3 * scale), 1.13 * Math.PI, 0.875 * Math.PI, true);
  ctx.closePath();
  ctx.fill();

  ctx.font = `bold ${fontSize * scale}px ${fontFamily}`;
  ctx.fillStyle = 'black';
  ctx.textAlign = 'center';
  ctx.fillText(loyaltyCost, x, bottomY - (7 * scale));
};

export const drawLoyaltyBox = (ctx, {
  cardLoyalty,
  x,
  y,
  scale = 1,
  fontFamily = 'Serif',
}) => {
  const leftArcProps = { x: x - (61 * scale), y: y - (19 * scale), radius: (29 * scale) };
  const topArcProps = { x, y: y - (52 * scale), radius: (11 * scale) };
  const rightArcProps = { x: x + (60 * scale), y: y - (19 * scale), radius: (29 * scale) };

  ctx.fillStyle = 'black';
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(leftArcProps.x, leftArcProps.y, leftArcProps.radius, 0.075 * Math.PI, 1.765 * Math.PI, true);
  ctx.arc(topArcProps.x, topArcProps.y, topArcProps.radius, 0.90 * Math.PI, 0.1 * Math.PI, true);
  ctx.arc(rightArcProps.x, rightArcProps.y, rightArcProps.radius, 1.225 * Math.PI, 0.925 * Math.PI, true);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.moveTo(x, y - (5 * scale));
  ctx.arc(leftArcProps.x + scale, leftArcProps.y, leftArcProps.radius + (3 * scale), 0.045 * Math.PI, 1.82 * Math.PI, true);
  ctx.arc(topArcProps.x, topArcProps.y + scale, topArcProps.radius + (4 * scale), 0.825 * Math.PI, 0.175 * Math.PI, true);
  ctx.arc(rightArcProps.x - scale, rightArcProps.y, rightArcProps.radius + (3 * scale), 1.18 * Math.PI, 0.955 * Math.PI, true);
  ctx.closePath();
  ctx.fill();

  const fontSize = 27 * scale;

  ctx.font = `bold ${fontSize}px ${fontFamily}`;
  ctx.fillStyle = 'black';
  ctx.textAlign = 'center';
  ctx.fillText(cardLoyalty, x, y - (12 * scale));
};

const traceHexagonPath = (ctx, { x, y, radius }) => {
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

export const drawSagaChapter = (ctx, {
  romanNumeral,
  x,
  y,
  scale = 1,
  fontFamily = 'Tahoma',
  fontSize = 17.5,
}) => {
  const outerRadius = 22.5 * scale;
  const innerRadius = outerRadius - 3.75 * scale;

  ctx.fillStyle = 'black';
  traceHexagonPath(ctx, { x, y, radius: outerRadius });
  ctx.fill();

  ctx.fillStyle = 'white';
  traceHexagonPath(ctx, { x, y, radius: innerRadius });
  ctx.fill();

  const previousTextAlign = ctx.textAlign;
  const previousTextBaseline = ctx.textBaseline;
  const previousFont = ctx.font;

  ctx.font = `bold ${fontSize * scale}px ${fontFamily}`;
  ctx.fillStyle = 'black';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(romanNumeral, x, y + 1.25 * scale);

  ctx.textAlign = previousTextAlign;
  ctx.textBaseline = previousTextBaseline;
  ctx.font = previousFont;
};

