import {
  boostHighlightsPassAdaptive,
  boostHighlightsPassFixed,
  contoursPassAdaptive,
  lightGrayscalePass,
  midBrightnessPassAdaptive,
  midBrightnessPassFixed,
} from './canvasFilters';

test('turns pixels into light grays, by their brightness', () => {
  // A black, a white and a pure green pixel
  const pixels = new Uint8ClampedArray([0, 0, 0, 255, 255, 255, 255, 255, 0, 255, 0, 255]);
  const ctx = createCtx(pixels);

  lightGrayscalePass(ctx, 0, 0, 3, 1);

  // Black is lifted 35% of the way to white, white stays white, and green is
  // as bright as 71.52% white before lifting it
  const green = 0.7152 * 255 + (255 - 0.7152 * 255) * 0.35;
  expect([...pixels]).toEqual([89, 89, 89, 255, 255, 255, 255, 255, ...Array(3).fill(Math.round(green)), 255]);
  expect(ctx.putImageData).toHaveBeenCalledWith({ data: pixels, width: 3, height: 1 }, 0, 0);
});

describe('shaded art', () => {
  // Thresholds of the shaded levels, and the shades of pixels above each of them
  const THRESHOLDS = [170, 128, 95, 60, 20];
  const shadeOf = (brightness: number) => {
    return [255, 245, 235, 220, 170][THRESHOLDS.findIndex((threshold) => brightness > threshold)] ?? 150;
  };

  test('shades pixels by their brightness, with the same thresholds for any art', () => {
    const grays = [10, 30, 70, 100, 150, 200];
    const pixels = grayPixels(grays);

    boostHighlightsPassFixed(createCtx(pixels), 0, 0, grays.length, 1);

    expect(shadesOf(pixels)).toEqual([150, 170, 220, 235, 245, 255]);
  });

  test('keeps the thresholds for art with every brightness equally present', () => {
    const grays = Array.from({ length: 2560 }, (_, i) => i / 10);
    const pixels = grayPixels(grays);

    boostHighlightsPassAdaptive(createCtx(pixels), 0, 0, grays.length, 1);

    expectShadedAs(grays, pixels, shadeOf);
  });

  test('moves the thresholds into the brightness range of the art, proportionally', () => {
    // Art that only goes from 100 to 200 is shaded like art going from 0 to 255
    const grays = Array.from({ length: 1000 }, (_, i) => 100 + i / 10);
    const pixels = grayPixels(grays);

    boostHighlightsPassAdaptive(createCtx(pixels), 0, 0, grays.length, 1);

    expectShadedAs(grays, pixels, (gray) => shadeOf(((gray - 100) / 100) * 255));
  });

  test('ignores the few darkest and brightest pixels when measuring the brightness range', () => {
    // A black and a white pixel among 1000 from 100 to 200
    const grays = [0, ...Array.from({ length: 998 }, (_, i) => 100 + i / 10), 255];
    const pixels = grayPixels(grays);

    boostHighlightsPassAdaptive(createCtx(pixels), 0, 0, grays.length, 1);

    expectShadedAs(grays.slice(1, -1), pixels.slice(4, -4), (gray) => shadeOf(((gray - 100) / 100) * 255));
  });

  test('keeps the thresholds for art of a single brightness', () => {
    const pixels = grayPixels([100, 100, 100]);

    boostHighlightsPassAdaptive(createCtx(pixels), 0, 0, 3, 1);

    expect(shadesOf(pixels)).toEqual([235, 235, 235]);
  });

  // Pixels near a threshold can fall on either side of it, as the brightness range is measured in whole values
  const expectShadedAs = (grays: number[], pixels: Uint8ClampedArray, expectedShadeOf: (gray: number) => number) => {
    const shades = shadesOf(pixels);
    const mismatches = grays.filter((gray, i) => shades[i] !== expectedShadeOf(gray));
    expect(mismatches.length).toBeLessThan(grays.length * 0.02);
  };
});

describe('minimal art', () => {
  test('shades the midtones of the art, leaving the darkest and brightest pixels light', () => {
    const grays = [10, 30, 70, 100, 150, 200];
    const pixels = grayPixels(grays);

    midBrightnessPassFixed(createCtx(pixels), 0, 0, grays.length, 1);

    expect(shadesOf(pixels)).toEqual([245, 210, 180, 230, 255, 255]);
  });

  test('moves the thresholds into the brightness range of the art, proportionally', () => {
    // Art that only goes from 100 to 200: its pixels at 100 + 70 / 255 * 100 are shaded like ones at 70
    const grays = Array.from({ length: 1000 }, (_, i) => 100 + i / 10);
    const pixels = grayPixels(grays);

    midBrightnessPassAdaptive(createCtx(pixels), 0, 0, grays.length, 1);

    const shades = shadesOf(pixels);
    expect(shades[grays.indexOf(127.5)]).toBe(180);
    expect(new Set(shades)).toEqual(new Set([255, 230, 180, 210, 245]));
  });
});

describe('contours', () => {
  // A 20x10 image of two halves of gray, with the edge between columns 9 and 10
  const twoHalves = (left: number, right: number) => {
    return grayPixels(Array.from({ length: 200 }, (_, i) => (i % 20 < 10 ? left : right)));
  };
  const columnShades = (pixels: Uint8ClampedArray) => {
    return shadesOf(pixels).slice(0, 20);
  };

  test('draws lines along the edges of the art, leaving the rest white', () => {
    const pixels = twoHalves(0, 255);

    contoursPassAdaptive(createCtx(pixels, 20, 10), 0, 0, 20, 10);

    // A single dark line, one pixel wide, along the edge
    const shades = columnShades(pixels);
    expect(shades).toEqual(Array.from({ length: 20 }, (_, column) => (column === 9 ? 100 : 255)));
    // Every row has the same line
    expect(shadesOf(pixels)).toEqual(Array.from({ length: 10 }, () => shades).flat());
  });

  test('draws the same lines for edges of any contrast', () => {
    const strong = twoHalves(0, 255);
    const faint = twoHalves(120, 140);

    contoursPassAdaptive(createCtx(strong, 20, 10), 0, 0, 20, 10);
    contoursPassAdaptive(createCtx(faint, 20, 10), 0, 0, 20, 10);

    expect(columnShades(faint)).toEqual(columnShades(strong));
  });

  test('leaves out short contours not connected to anything, like dots', () => {
    // A 30x30 image with a step from black to white between columns 9 and 10, and a single dark pixel far from it
    const grays = Array.from({ length: 900 }, (_, i) => (i % 30 < 10 ? 0 : 255));
    grays[20 * 30 + 22] = 0;
    const pixels = grayPixels(grays);

    contoursPassAdaptive(createCtx(pixels, 30, 30), 0, 0, 30, 30);

    const shades = shadesOf(pixels);
    expect(shades.filter((shade, i) => i % 30 > 12 && shade !== 255)).toEqual([]);
    expect(Array.from({ length: 30 }, (_, row) => shades[row * 30 + 9])).toEqual(Array(30).fill(100));
  });

  test('draws weak edges only where they continue a line', () => {
    // A 60x40 image: stripes on top, so strong edges take a share of the art that leaves weak ones out of the lines.
    // Below, an edge at column 40 fades from strong to weak, or ends, with a weak edge apart from it
    const image = (fading: boolean) => {
      return grayPixels(
        Array.from({ length: 2400 }, (_, i) => {
          const [x, y] = [i % 60, Math.floor(i / 60)];
          if (y < 20) return Math.floor(x / 12) % 2 ? 255 : 0;
          if (fading || y < 30) return x < 40 ? 128 : Math.round(255 - ((y - 20) * 97) / 19);
          return x >= 50 && y >= 34 ? 158 : 128;
        }),
      );
    };
    const fading = image(true);
    const apart = image(false);

    contoursPassAdaptive(createCtx(fading, 60, 40), 0, 0, 60, 40);
    contoursPassAdaptive(createCtx(apart, 60, 40), 0, 0, 60, 40);

    const shadeAt = (pixels: Uint8ClampedArray, x: number, y: number) => pixels[(y * 60 + x) * 4];
    // Rows below where the edge meets the stripes, which leaves a gap in the line
    const rows = Array.from({ length: 16 }, (_, i) => 23 + i);
    expect(rows.map((y) => shadeAt(fading, 40, y)).filter((shade) => shade === 255)).toEqual([]);
    const belowEnd = rows
      .filter((y) => y > 30)
      .flatMap((y) => Array.from({ length: 15 }, (_, x) => shadeAt(apart, 45 + x, y)));
    expect(belowEnd.filter((shade) => shade !== 255)).toEqual([]);
  });

  test('draws no lines for flat art, or for edges too faint to be contours', () => {
    const flat = twoHalves(128, 128);
    const faint = twoHalves(128, 130);

    contoursPassAdaptive(createCtx(flat, 20, 10), 0, 0, 20, 10);
    contoursPassAdaptive(createCtx(faint, 20, 10), 0, 0, 20, 10);

    expect(new Set(shadesOf(flat))).toEqual(new Set([255]));
    expect(new Set(shadesOf(faint))).toEqual(new Set([255]));
  });
});

// Gray pixels, as bright as their value
const grayPixels = (grays: number[]) => {
  return new Uint8ClampedArray(grays.flatMap((gray) => [gray, gray, gray, 255]));
};

const shadesOf = (pixels: Uint8ClampedArray) => {
  return Array.from({ length: pixels.length / 4 }, (_, i) => pixels[i * 4]);
};

const createCtx = (pixels: Uint8ClampedArray, width = pixels.length / 4, height = 1) => {
  return {
    getImageData: vi.fn(() => ({ data: pixels, width, height })),
    putImageData: vi.fn(),
  } as unknown as CanvasRenderingContext2D & { putImageData: ReturnType<typeof vi.fn> };
};
