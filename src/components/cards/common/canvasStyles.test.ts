import { getFillStyle, getInkFill } from './canvasStyles';

interface FakeGradient {
  stops: [number, string][];
  addColorStop: (offset: number, color: string) => void;
}

describe('getInkFill', () => {
  test('has no fill on the low ink level', () => {
    expect(getInkFill(createCtx(), ['red'], 'low')).toBeNull();
    expect(getInkFill(createCtx(), ['red'], 'low', 'light')).toBeNull();
  });

  test('fills with the colors on the splurge ink level', () => {
    const ctx = createCtx();

    expect(getInkFill(ctx, ['red'], 'splurge')).toEqual({ style: 'red', opacity: 0.35 });
    expect((getInkFill(ctx, ['green', 'white'], 'splurge')?.style as unknown as FakeGradient).stops).toEqual([
      [0.4, 'green'],
      [0.6, 'white'],
    ]);
  });

  test('fills lightly with the colors only on the splurge ink level', () => {
    expect(getInkFill(createCtx(), ['red'], 'medium', 'light')).toBeNull();
    expect(getInkFill(createCtx(), ['red'], 'splurge', 'light')).toEqual({ style: 'red', opacity: 0.15 });
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
