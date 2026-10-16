import { getFillStyle } from './canvasStyles';

interface FakeGradient {
  stops: [number, string][];
  addColorStop: (offset: number, color: string) => void;
}

const createCtx = () => {
  const gradient: FakeGradient = {
    stops: [],
    addColorStop: (offset, color) => {
      gradient.stops.push([offset, color]);
    },
  };
  return { canvas: { width: 500 }, createLinearGradient: vi.fn(() => gradient) } as unknown as CanvasRenderingContext2D;
};

test('fills with a single color as it is', () => {
  const ctx = createCtx();

  expect(getFillStyle(ctx, ['red'])).toBe('red');
  expect(ctx.createLinearGradient).not.toHaveBeenCalled();
});

test('fills with two colors as a horizontal gradient across the canvas, from the first to the second', () => {
  const ctx = createCtx();

  const style = getFillStyle(ctx, ['green', 'white']);

  expect(ctx.createLinearGradient).toHaveBeenCalledWith(0, 0, 500, 0);
  expect((style as unknown as FakeGradient).stops).toEqual([
    [0.4, 'green'],
    [0.6, 'white'],
  ]);
});
