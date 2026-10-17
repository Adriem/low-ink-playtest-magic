/** How much lighter black-and-white art is drawn, as a share of the way to white */
const BLACK_AND_WHITE_LIGHTENING = 0.35;

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

/**
 * Turn an area of the canvas into light shades of gray: its brightness, moved
 * part of the way to white, so it takes less ink.
 */
export const lightGrayscalePass = (ctx: CanvasRenderingContext2D, sx: number, sy: number, sw: number, sh: number) => {
  const imagePixels = ctx.getImageData(sx, sy, sw, sh);
  const data = imagePixels.data;

  for (let i = 0; i < data.length; i += 4) {
    const brightness = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
    data[i] = data[i + 1] = data[i + 2] = brightness + (255 - brightness) * BLACK_AND_WHITE_LIGHTENING;
  }
  ctx.putImageData(imagePixels, sx, sy);
};
