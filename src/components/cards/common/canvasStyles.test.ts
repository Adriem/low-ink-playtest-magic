import { getFillStyle, getInkFillStyle } from './canvasStyles';

interface FakeGradient {
  stops: [number, string][];
  addColorStop: (offset: number, color: string) => void;
}

describe('getInkFillStyle', () => {
  test('has no fill on the low ink level', () => {
    expect(getInkFillStyle(createCtx(), ['red'], 'low')).toBeNull();
  });

  test('fills with the colors on the splurge ink level', () => {
    const ctx = createCtx();

    expect(getInkFillStyle(ctx, ['red'], 'splurge')).toBe('red');
    expect((getInkFillStyle(ctx, ['green', 'white'], 'splurge') as unknown as FakeGradient).stops).toEqual([
      [0.4, 'green'],
      [0.6, 'white'],
    ]);
  });
});

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

const createCtx = () => {
  const gradient: FakeGradient = {
    stops: [],
    addColorStop: (offset, color) => {
      gradient.stops.push([offset, color]);
    },
  };
  return { canvas: { width: 500 }, createLinearGradient: vi.fn(() => gradient) } as unknown as CanvasRenderingContext2D;
};
