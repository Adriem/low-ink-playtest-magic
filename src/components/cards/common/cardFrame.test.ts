import { drawCardFrame } from './cardFrame';

const createCtx = () => {
  const drawn: unknown[][] = [];
  const ctx = {
    canvas: { width: 500, height: 700 },
    globalCompositeOperation: 'source-over',
    strokeStyle: '',
    lineWidth: 0,
    drawn,
    save: vi.fn(),
    restore: vi.fn(),
    resetTransform: vi.fn(),
    beginPath: vi.fn(),
    roundRect: (...args: unknown[]) => drawn.push(['roundRect', ...args]),
    fill: () => drawn.push(['fill', ctx.globalCompositeOperation]),
    clip: () => drawn.push(['clip']),
    stroke: () => drawn.push(['stroke', ctx.strokeStyle, ctx.lineWidth]),
  };
  return ctx;
};

test('draws nothing on cards with square corners and no outline', () => {
  const ctx = createCtx();

  drawCardFrame(ctx as unknown as CanvasRenderingContext2D, {}, 'black');

  expect(ctx.drawn).toEqual([]);
});

test('keeps only what is inside the rounded corners', () => {
  const ctx = createCtx();

  drawCardFrame(ctx as unknown as CanvasRenderingContext2D, { roundedCorners: true }, 'black');

  expect(ctx.drawn).toEqual([
    ['roundRect', 0, 0, 500, 700, 20],
    ['fill', 'destination-in'],
  ]);
});

test('outlines the edges of the card, inside them, following its corners', () => {
  const ctx = createCtx();

  drawCardFrame(ctx as unknown as CanvasRenderingContext2D, { outlined: true, roundedCorners: true }, 'black');

  expect(ctx.drawn.slice(2)).toEqual([['roundRect', 0, 0, 500, 700, 20], ['clip'], ['stroke', 'black', 8]]);
  expect(ctx.resetTransform).toHaveBeenCalled();
});
