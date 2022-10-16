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
}) => {
  ctx.moveTo(x, y);

  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = strokeStyle;
  ctx.fillStyle = fillStyle;

  ctx.beginPath();
  ctx.ellipse(
    x + lineWidth / 2 + height / 4,
    y + lineWidth / 2 + height / 2,
    height / 4,
    height / 2,
    0,
    0.5 * Math.PI,
    1.5 * Math.PI,
  );
  ctx.ellipse(
    x + width - lineWidth / 2 - height / 4,
    y + lineWidth / 2 + height / 2,
    height / 4,
    height / 2,
    0,
    1.5 * Math.PI,
    0.5 * Math.PI,
  );
  ctx.closePath();

  if (fillStyle != null) ctx.fill();
  if (strokeStyle != null) ctx.stroke();
};

export const drawLoyaltyBox = (ctx, {
  cardLoyalty,
  x,
  y,
  scale = 1,
  fontFamily = 'Serif'
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

