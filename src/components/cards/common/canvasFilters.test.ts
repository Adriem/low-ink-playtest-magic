import { boostHighlightsPassAdaptive, boostHighlightsPassFixed, lightGrayscalePass } from './canvasFilters';

test('turns pixels into light grays, by their brightness', () => {
  // A black, a white and a pure green pixel
  const pixels = new Uint8ClampedArray([0, 0, 0, 255, 255, 255, 255, 255, 0, 255, 0, 255]);
  const ctx = createCtx(pixels);

  lightGrayscalePass(ctx, 0, 0, 3, 1);

  // Black is lifted 35% of the way to white, white stays white, and green is
  // as bright as 71.52% white before lifting it
  const green = 0.7152 * 255 + (255 - 0.7152 * 255) * 0.35;
  expect([...pixels]).toEqual([89, 89, 89, 255, 255, 255, 255, 255, ...Array(3).fill(Math.round(green)), 255]);
  expect(ctx.putImageData).toHaveBeenCalledWith({ data: pixels }, 0, 0);
});

describe('shaded art', () => {
  // Thresholds of the shaded levels, and the shades of pixels above each of them
  const THRESHOLDS = [170, 128, 95, 60, 20];
  const shadeOf = (brightness: number) => {
    return [255, 245, 235, 200, 170][THRESHOLDS.findIndex((threshold) => brightness > threshold)] ?? 150;
  };

  test('shades pixels by their brightness, with the same thresholds for any art', () => {
    const grays = [10, 30, 70, 100, 150, 200];
    const pixels = grayPixels(grays);

    boostHighlightsPassFixed(createCtx(pixels), 0, 0, grays.length, 1);

    expect(shadesOf(pixels)).toEqual([150, 170, 200, 235, 245, 255]);
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

// Gray pixels, as bright as their value
const grayPixels = (grays: number[]) => {
  return new Uint8ClampedArray(grays.flatMap((gray) => [gray, gray, gray, 255]));
};

const shadesOf = (pixels: Uint8ClampedArray) => {
  return Array.from({ length: pixels.length / 4 }, (_, i) => pixels[i * 4]);
};

const createCtx = (pixels: Uint8ClampedArray) => {
  return {
    getImageData: vi.fn(() => ({ data: pixels })),
    putImageData: vi.fn(),
  } as unknown as CanvasRenderingContext2D & { putImageData: ReturnType<typeof vi.fn> };
};
