import { lightGrayscalePass } from './canvasFilters';

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

const createCtx = (pixels: Uint8ClampedArray) => {
  return {
    getImageData: vi.fn(() => ({ data: pixels })),
    putImageData: vi.fn(),
  } as unknown as CanvasRenderingContext2D & { putImageData: ReturnType<typeof vi.fn> };
};
