import { getCanvasColor, getFillStyle, getInkFill, resolvePalette } from './canvasStyles';

interface FakeGradient {
  stops: [number, string][];
  addColorStop: (offset: number, color: string) => void;
}

describe('getInkFill', () => {
  test('has no fill on the low ink level', () => {
    expect(getInkFill(createCtx(), ['red'], 'low')).toBeNull();
    expect(getInkFill(createCtx(), ['red'], 'low', 'light')).toBeNull();
  });

  test('fills with the colors on the high ink level', () => {
    const ctx = createCtx();

    expect(getInkFill(ctx, ['red'], 'high')).toEqual({ style: 'red', opacity: 0.35 });
    expect((getInkFill(ctx, ['green', 'white'], 'high')?.style as unknown as FakeGradient).stops).toEqual([
      [0.4, 'green'],
      [0.6, 'white'],
    ]);
  });

  test('fills lightly with the colors only from the high ink level', () => {
    expect(getInkFill(createCtx(), ['red'], 'medium', 'light')).toBeNull();
    expect(getInkFill(createCtx(), ['red'], 'high', 'light')).toEqual({ style: 'red', opacity: 0.15 });
  });
});

test('makes the canvas black on black-bordered cards, and the paper color on the others', () => {
  const palette = { PAPER: '#ffffff', LINE: '#000000' };

  expect(getCanvasColor(palette)).toBe('#ffffff');
  expect(getCanvasColor(palette, true)).toBe('#000000');
});

test('replaces the colors of a palette with its custom colors, when they are hex colors of its own', () => {
  const defaults = { RED: '#d30e0e', BLUE: '#2985e1', TEXT: '#000000' };

  expect(resolvePalette(defaults)).toEqual(defaults);
  expect(resolvePalette(defaults, { RED: '#ff0000', BLUE: 'blue', PINK: '#ffc0cb' })).toEqual({
    RED: '#ff0000',
    BLUE: '#2985e1',
    TEXT: '#000000',
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
