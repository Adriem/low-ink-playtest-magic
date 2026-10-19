/** How much lighter `lightenGrayscale` draws pixels, as a share of the way to white */
const GRAYSCALE_LIGHTENING = 0.35;

/** A shade of gray, for the pixels brighter than its threshold (and not brighter than the level above's) */
interface ShadeLevel {
  threshold: number;
  shade: number;
}

/**
 * Shades of gray of `shadeMidtones…`, from the brightest pixels down. The
 * darkest pixels turn light again, so only the midtones take ink. The
 * thresholds are meant for art with every brightness, from 0 to 255, equally
 * present.
 */
const MIDTONE_SHADES: ShadeLevel[] = [
  { threshold: 128, shade: 255 },
  { threshold: 95, shade: 230 },
  { threshold: 60, shade: 180 },
  { threshold: 20, shade: 210 },
  { threshold: -Infinity, shade: 245 },
];

/**
 * Shades of gray of `posterizeLight…`, from the brightest pixels down: a few
 * light grays, in the same order as the brightness. The thresholds are meant for art with every brightness, from 0 to 255,
 * equally present.
 */
const LIGHT_POSTER_SHADES: ShadeLevel[] = [
  { threshold: 170, shade: 255 },
  { threshold: 128, shade: 245 },
  { threshold: 95, shade: 235 },
  { threshold: 60, shade: 220 },
  { threshold: 20, shade: 170 },
  { threshold: -Infinity, shade: 150 },
];

/**
 * Share of the darkest, and of the brightest, pixels left out when measuring
 * the brightness range of art, so a few outliers don't set it.
 */
const BRIGHTNESS_RANGE_OUTLIERS = 0.01;

/**
 * Lines of `traceContoursAdaptive`, from the strongest edges down: pixels
 * among the art's strongest edges, up to a level's share of its pixels, take
 * its shade. Pixels of `connectedOnly` levels are only kept where they connect
 * to the lines of the other levels, so weak edges extend the contours (e.g.
 * where an outline fades) without adding traces of their own. The rest of the
 * art turns white.
 */
const CONTOUR_LINES: { share: number; shade: number; connectedOnly?: boolean }[] = [
  { share: 0.08, shade: 100 },
  { share: 0.2, shade: 160 },
  { share: 0.35, shade: 160, connectedOnly: true },
];

/**
 * Edge strength below which pixels are never contours, so flat art doesn't
 * turn its noise into lines to fill the shares of the levels.
 */
const MIN_CONTOUR_STRENGTH = 6;

/**
 * Pixels in the shortest contours kept: contours with fewer of them, like
 * dots and short traces not connected to anything, are noise.
 */
const MIN_CONTOUR_PIXELS = 10;

/**
 * Trace the contours of the art in an area of the canvas as thin gray lines
 * on white, with adaptive thresholds. Nothing else of the art stays.
 *
 * Contours are where the brightness changes fastest, measured with a Sobel
 * filter on the brightness, blurred first so texture and noise don't count.
 * Edges are thinned to the pixels where they're strongest across them, so
 * each contour is a single line, one pixel wide. The thresholds are shares of
 * the art's own edges (`CONTOUR_LINES`): its strongest edges take the darkest
 * lines, so low-contrast art gets as many
 * contours as high-contrast art. Edges weaker than `MIN_CONTOUR_STRENGTH` are
 * never contours, and contours shorter than `MIN_CONTOUR_PIXELS` (dots and
 * short traces not connected to anything) are left out as noise. Then the
 * lines left are extended with the weak edges connected to them (the
 * `connectedOnly` levels).
 */
export const traceContoursAdaptive = (
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  sw: number,
  sh: number,
) => {
  const imagePixels = ctx.getImageData(sx, sy, sw, sh);
  const { data, width, height } = imagePixels;

  const { strengths, thinStrengths } = getEdgeStrengths(blur(getBrightnesses(data), width, height), width, height);
  // The thresholds come from the edges before thinning them, which leaves most pixels with no strength
  const sortedStrengths = strengths.slice().sort();
  const levels = CONTOUR_LINES.map(({ share, ...level }) => {
    const threshold = sortedStrengths[Math.floor((1 - share) * (sortedStrengths.length - 1))];
    return { ...level, threshold: Math.max(threshold, MIN_CONTOUR_STRENGTH) };
  });

  const pixelLevels = Array.from(thinStrengths, (strength) => levels.find(({ threshold }) => strength > threshold));
  const shades = Float64Array.from(pixelLevels, (level) => (level && !level.connectedOnly ? level.shade : 255));
  // Noise is removed before extending the lines, so weak edges don't make it long enough to stay
  removeShortContours(shades, width, height);
  const extensionShades = Float64Array.from(pixelLevels, (level) => (level?.connectedOnly ? level.shade : 255));
  extendContours(shades, extensionShades, width, height);

  for (const [i, shade] of shades.entries()) {
    data[i * 4] = data[i * 4 + 1] = data[i * 4 + 2] = shade;
  }
  ctx.putImageData(imagePixels, sx, sy);
};

/**
 * Extend the contours of a grid of shades (the pixels that aren't white) with
 * the pixels of another grid of shades connected to them, directly or through
 * each other, by their sides or corners.
 */
const extendContours = (shades: Float64Array, extensionShades: Float64Array, width: number, height: number) => {
  const reached: number[] = [];
  for (const [i, shade] of shades.entries()) {
    if (shade !== 255) reached.push(i);
  }

  for (let next = 0; next < reached.length; next++) {
    forEachNeighbor(reached[next], width, height, (neighbor) => {
      if (shades[neighbor] !== 255 || extensionShades[neighbor] === 255) return;
      shades[neighbor] = extensionShades[neighbor];
      reached.push(neighbor);
    });
  }
};

/**
 * Turn white the contours, of a grid of shades, with fewer pixels than
 * `MIN_CONTOUR_PIXELS`: the pixels that aren't white, connected to each other
 * by their sides or corners.
 */
const removeShortContours = (shades: Float64Array, width: number, height: number) => {
  const seen = new Uint8Array(shades.length);
  for (let start = 0; start < shades.length; start++) {
    if (seen[start] || shades[start] === 255) continue;

    // Every pixel of the contour, found from its neighbors
    const contour = [start];
    seen[start] = 1;
    for (let next = 0; next < contour.length; next++) {
      forEachNeighbor(contour[next], width, height, (neighbor) => {
        if (seen[neighbor] || shades[neighbor] === 255) return;
        seen[neighbor] = 1;
        contour.push(neighbor);
      });
    }

    if (contour.length < MIN_CONTOUR_PIXELS) {
      for (const pixel of contour) shades[pixel] = 255;
    }
  }
};

/**
 * Values of a grid blurred with the average of each value and its neighbors.
 */
const blur = (values: Float64Array, width: number, height: number): Float64Array => {
  const blurred = new Float64Array(values.length);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sum = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) sum += getClamped(values, width, height, x + dx, y + dy);
      }
      blurred[y * width + x] = sum / 9;
    }
  }
  return blurred;
};

/**
 * Edge strength of each value of a grid: how fast the values change around it,
 * with a Sobel filter. Thinned, only where that's stronger than at its two
 * neighbors across the edge, and 0 elsewhere: along a blurred edge, the
 * strength peaks in its middle, which thinning keeps as a line one value wide.
 */
const getEdgeStrengths = (
  values: Float64Array,
  width: number,
  height: number,
): { strengths: Float64Array; thinStrengths: Float64Array } => {
  const at = (x: number, y: number) => getClamped(values, width, height, x, y);
  const strengths = new Float64Array(values.length);
  // Neighbor across the edge, as the step from each value to it
  const steps = new Array<[number, number]>(values.length);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const gx =
        at(x + 1, y - 1) + 2 * at(x + 1, y) + at(x + 1, y + 1) - at(x - 1, y - 1) - 2 * at(x - 1, y) - at(x - 1, y + 1);
      const gy =
        at(x - 1, y + 1) + 2 * at(x, y + 1) + at(x + 1, y + 1) - at(x - 1, y - 1) - 2 * at(x, y - 1) - at(x + 1, y - 1);
      strengths[y * width + x] = Math.hypot(gx, gy);
      steps[y * width + x] = getStepAcrossEdge(gx, gy);
    }
  }

  const thinStrengths = new Float64Array(values.length);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const strength = strengths[y * width + x];
      const [dx, dy] = steps[y * width + x];
      const before = getClamped(strengths, width, height, x - dx, y - dy);
      const after = getClamped(strengths, width, height, x + dx, y + dy);
      // Of two equally strong values in the middle of an edge, only the first one is kept
      if (strength > before && strength >= after) thinStrengths[y * width + x] = strength;
    }
  }
  return { strengths, thinStrengths };
};

/**
 * Step to the nearest neighbor in the direction the values change fastest,
 * across the edge: right, down-right, down or up-right (y grows downwards).
 */
const getStepAcrossEdge = (gx: number, gy: number): [number, number] => {
  const angle = ((Math.atan2(gy, gx) * 180) / Math.PI + 180) % 180;
  if (angle < 22.5 || angle >= 157.5) return [1, 0];
  if (angle < 67.5) return [1, 1];
  if (angle < 112.5) return [0, 1];
  return [1, -1];
};

/**
 * Call a function with each neighbor of a position of a grid, by its sides or
 * corners, inside the grid.
 */
const forEachNeighbor = (position: number, width: number, height: number, callback: (neighbor: number) => void) => {
  const x = position % width;
  const y = Math.floor(position / width);
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const nx = x + dx;
      const ny = y + dy;
      if ((dx !== 0 || dy !== 0) && nx >= 0 && nx < width && ny >= 0 && ny < height) callback(ny * width + nx);
    }
  }
};

/**
 * Value of a grid at a position, or at the nearest one inside the grid.
 */
const getClamped = (values: Float64Array, width: number, height: number, x: number, y: number): number => {
  const clampedX = Math.min(Math.max(x, 0), width - 1);
  const clampedY = Math.min(Math.max(y, 0), height - 1);
  return values[clampedY * width + clampedX];
};

/**
 * Shade the midtones of the art in an area of the canvas in a few light grays
 * (`MIDTONE_SHADES`), with fixed thresholds: the darkest and the brightest
 * pixels both turn light, so only the midtones take ink. The thresholds are
 * the same for any art.
 *
 * Not used: kept to compare it with `shadeMidtonesAdaptive`.
 */
export const shadeMidtonesFixed = (ctx: CanvasRenderingContext2D, sx: number, sy: number, sw: number, sh: number) => {
  shadeByBrightness(ctx, sx, sy, sw, sh, () => MIDTONE_SHADES);
};

/**
 * Shade the midtones of the art in an area of the canvas in a few light grays
 * (`MIDTONE_SHADES`), with adaptive thresholds: the darkest and the brightest
 * pixels both turn light, so only the midtones take ink. The thresholds are
 * fitted to the art's brightness range, like `posterizeLightAdaptive` does.
 */
export const shadeMidtonesAdaptive = (
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  sw: number,
  sh: number,
) => {
  shadeByBrightness(ctx, sx, sy, sw, sh, (brightnesses) => fitLevelsToBrightness(MIDTONE_SHADES, brightnesses));
};

/**
 * Posterize the art in an area of the canvas into a few light grays
 * (`LIGHT_POSTER_SHADES`), in the same order as its brightness, with fixed
 * thresholds: the same for any art.
 *
 * Not used: art that's mostly dark, bright or low in contrast falls into one
 * or two of the levels, so it comes out as flat gray or nearly blank (e.g.
 * Ishgard, the Holy See or Glasses of Urza). Kept to compare it with
 * `posterizeLightAdaptive`, which replaced it.
 */
export const posterizeLightFixed = (ctx: CanvasRenderingContext2D, sx: number, sy: number, sw: number, sh: number) => {
  shadeByBrightness(ctx, sx, sy, sw, sh, () => LIGHT_POSTER_SHADES);
};

/**
 * Posterize the art in an area of the canvas into a few light grays
 * (`LIGHT_POSTER_SHADES`), in the same order as its brightness, with adaptive
 * thresholds: fitted to the art's brightness range.
 *
 * The range is measured without the darkest and brightest outliers
 * (`BRIGHTNESS_RANGE_OUTLIERS`), and the thresholds move proportionally from
 * 0-255 into it: art that only goes from 100 to 200 is shaded like art going
 * from 0 to 255, while art with every brightness keeps the thresholds as they
 * are. So dark, bright or low-contrast art still gets every shade, though art
 * with a wide range but few dark pixels can come out darker than with
 * `posterizeLightFixed`.
 */
export const posterizeLightAdaptive = (
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  sw: number,
  sh: number,
) => {
  shadeByBrightness(ctx, sx, sy, sw, sh, (brightnesses) => fitLevelsToBrightness(LIGHT_POSTER_SHADES, brightnesses));
};

/**
 * Levels with their thresholds moved from the range of uniform art to the
 * brightness range of some art, both measured leaving the outliers out. Art
 * with no range to speak of keeps the levels as they are.
 */
const fitLevelsToBrightness = (levels: ShadeLevel[], brightnesses: Float64Array) => {
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
  getLevels: (brightnesses: Float64Array) => ShadeLevel[],
) => {
  const imagePixels = ctx.getImageData(sx, sy, sw, sh);
  const data = imagePixels.data;

  const brightnesses = getBrightnesses(data);
  const levels = getLevels(brightnesses);
  for (const [i, brightness] of brightnesses.entries()) {
    const { shade } = levels.find(({ threshold }) => brightness > threshold) ?? levels[levels.length - 1];
    data[i * 4] = data[i * 4 + 1] = data[i * 4 + 2] = shade;
  }
  ctx.putImageData(imagePixels, sx, sy);
};

/**
 * Turn the art in an area of the canvas to grayscale, lightened: each pixel's
 * brightness, moved part of the way to white (`GRAYSCALE_LIGHTENING`), so it
 * takes less ink.
 */
export const lightenGrayscale = (ctx: CanvasRenderingContext2D, sx: number, sy: number, sw: number, sh: number) => {
  const imagePixels = ctx.getImageData(sx, sy, sw, sh);
  const data = imagePixels.data;

  for (let i = 0; i < data.length; i += 4) {
    const brightness = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
    data[i] = data[i + 1] = data[i + 2] = brightness + (255 - brightness) * GRAYSCALE_LIGHTENING;
  }
  ctx.putImageData(imagePixels, sx, sy);
};

/**
 * Brightness of each pixel of some image data, from 0 to 255.
 */
const getBrightnesses = (data: Uint8ClampedArray): Float64Array => {
  const brightnesses = new Float64Array(data.length / 4);
  for (let i = 0; i < brightnesses.length; i++) {
    brightnesses[i] = 0.2126 * data[i * 4] + 0.7152 * data[i * 4 + 1] + 0.0722 * data[i * 4 + 2];
  }
  return brightnesses;
};
