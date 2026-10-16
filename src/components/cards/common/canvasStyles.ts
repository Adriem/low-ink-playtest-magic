/**
 * Fill style for a single color, or for two colors a horizontal gradient
 * across the canvas from the first one to the second.
 */
export const getFillStyle = (
  ctx: CanvasRenderingContext2D,
  colors: readonly [string] | readonly [string, string],
): string | CanvasGradient => {
  if (colors.length === 1) return colors[0];

  const [startColor, endColor] = colors;
  const gradient = ctx.createLinearGradient(0, 0, ctx.canvas.width, 0);
  gradient.addColorStop(.4, startColor);
  gradient.addColorStop(.6, endColor);
  return gradient;
};
