export const midBrightnessPass = (ctx: CanvasRenderingContext2D, sx: number, sy: number, sw: number, sh: number) => {
  const imagePixels = ctx.getImageData(sx, sy, sw, sh);
  const data = imagePixels.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const computedBrightness = 0.2126 * r + 0.7152 * g + 0.0722 * b;

    if (computedBrightness > 170) {
      data[i] = data[i + 1] = data[i + 2] = 255;
    } else if (computedBrightness > 128) {
      data[i] = data[i + 1] = data[i + 2] = 215;
    } else if (computedBrightness > 95) {
      data[i] = data[i + 1] = data[i + 2] = 170;
    } else if (computedBrightness > 60) {
      data[i] = data[i + 1] = data[i + 2] = 215;
    } else {
      data[i] = data[i + 1] = data[i + 2] = 255;
    }
  }
  ctx.putImageData(imagePixels, sx, sy);
};
