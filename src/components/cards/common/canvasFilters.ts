/** How much lighter black-and-white art is drawn, as a share of the way to white */
const BLACK_AND_WHITE_LIGHTENING = 0.35;

/**
 * Shades of gray of the shaded art fidelity, from the brightest pixels down:
 * pixels brighter than a level's threshold take its shade. The thresholds are
 * meant for art with every brightness, from 0 to 255, equally present.
 */
const SHADED_ART_LEVELS: { threshold: number; shade: number }[] = [
  { threshold: 170, shade: 255 },
  { threshold: 128, shade: 245 },
  { threshold: 95, shade: 235 },
  { threshold: 60, shade: 200 },
  { threshold: 20, shade: 170 },
  { threshold: -Infinity, shade: 150 },
];

/**
 * Share of the darkest, and of the brightest, pixels left out when measuring
 * the brightness range of art, so a few outliers don't set it.
 */
const BRIGHTNESS_RANGE_OUTLIERS = 0.01;

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
      data[i] = data[i + 1] = data[i + 2] = 245;
    } else if (computedBrightness > 95) {
      data[i] = data[i + 1] = data[i + 2] = 220;
    } else if (computedBrightness > 60) {
      data[i] = data[i + 1] = data[i + 2] = 180;
    } else if (computedBrightness > 20) {
      data[i] = data[i + 1] = data[i + 2] = 245;
    } else {
      data[i] = data[i + 1] = data[i + 2] = 255;
    }
  }
  ctx.putImageData(imagePixels, sx, sy);
};

/**
 * Filter of the shaded art fidelity, with fixed thresholds: shade an area of
 * the canvas in a few grays by brightness (`SHADED_ART_LEVELS`), with the same
 * thresholds for any art.
 *
 * Not used: art that's mostly dark, bright or low in contrast falls into one
 * or two of the levels, so it comes out as flat gray or nearly blank (e.g.
 * Ishgard, the Holy See or Glasses of Urza). Kept to compare it with
 * `boostHighlightsPassAdaptive`, which replaced it.
 */
export const boostHighlightsPassFixed = (
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  sw: number,
  sh: number,
) => {
  shadeByBrightness(ctx, sx, sy, sw, sh, () => SHADED_ART_LEVELS);
};

/**
 * Filter of the shaded art fidelity, with adaptive thresholds: shade an area
 * of the canvas in a few grays by brightness (`SHADED_ART_LEVELS`), with the
 * thresholds fitted to the art's brightness range.
 *
 * The range is measured without the darkest and brightest outliers
 * (`BRIGHTNESS_RANGE_OUTLIERS`), and the thresholds move proportionally from
 * 0-255 into it: art that only goes from 100 to 200 is shaded like art going
 * from 0 to 255, while art with every brightness keeps the thresholds as they
 * are. So dark, bright or low-contrast art still gets every shade, though art
 * with a wide range but few dark pixels can come out darker than with
 * `boostHighlightsPassFixed`.
 */
export const boostHighlightsPassAdaptive = (
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  sw: number,
  sh: number,
) => {
  shadeByBrightness(ctx, sx, sy, sw, sh, (brightnesses) => fitLevelsToBrightness(SHADED_ART_LEVELS, brightnesses));
};

/**
 * Levels with their thresholds moved from the range of uniform art to the
 * brightness range of some art, both measured leaving the outliers out. Art
 * with no range to speak of keeps the levels as they are.
 */
const fitLevelsToBrightness = (levels: typeof SHADED_ART_LEVELS, brightnesses: Float64Array) => {
  const [low, high] = getBrightnessRange(brightnesses);
  if (high - low < 1) return levels;

  const uniformLow = 255 * BRIGHTNESS_RANGE_OUTLIERS;
  const uniformHigh = 255 * (1 - BRIGHTNESS_RANGE_OUTLIERS);
  const scale = (high - low) / (uniformHigh - uniformLow);
  return levels.map(({ threshold, shade }) => ({ threshold: low + (threshold - uniformLow) * scale, shade }));
};

/**
 * Brightness range of some pixels, without the darkest and brightest
 * outliers: the brightness below which, and above which, that share of them
 * falls.
 */
const getBrightnessRange = (brightnesses: Float64Array): [number, number] => {
  const histogram = new Uint32Array(256);
  for (const brightness of brightnesses) histogram[Math.round(brightness)]++;

  const getPercentile = (share: number) => {
    const count = share * brightnesses.length;
    let seen = 0;
    for (let value = 0; value < 256; value++) {
      seen += histogram[value];
      if (seen > count) return value;
    }
    return 255;
  };
  return [getPercentile(BRIGHTNESS_RANGE_OUTLIERS), getPercentile(1 - BRIGHTNESS_RANGE_OUTLIERS)];
};

/**
 * Turn an area of the canvas into the shades of the levels its pixels' brightness falls in.
 *
 * @param getLevels - The levels to use, given the brightness of every pixel
 */
const shadeByBrightness = (
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  sw: number,
  sh: number,
  getLevels: (brightnesses: Float64Array) => typeof SHADED_ART_LEVELS,
) => {
  const imagePixels = ctx.getImageData(sx, sy, sw, sh);
  const data = imagePixels.data;

  const brightnesses = new Float64Array(data.length / 4);
  for (let i = 0; i < brightnesses.length; i++) {
    brightnesses[i] = 0.2126 * data[i * 4] + 0.7152 * data[i * 4 + 1] + 0.0722 * data[i * 4 + 2];
  }

  const levels = getLevels(brightnesses);
  for (const [i, brightness] of brightnesses.entries()) {
    const { shade } = levels.find(({ threshold }) => brightness > threshold) ?? levels[levels.length - 1];
    data[i * 4] = data[i * 4 + 1] = data[i * 4 + 2] = shade;
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
