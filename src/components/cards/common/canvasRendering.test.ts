// The testing-library rules mistake functions with "render" in their name
// (finishRender, whenRendered) for testing-library's render
/* eslint-disable testing-library/render-result-naming-convention */
import { deferred } from '../../../testUtils';
import { beginRender, drawWhenLoaded, finishRender, whenRendered } from './canvasRendering';

test('marks the canvas as rendered once its drawings finish', async () => {
  const { canvas, ctx } = setupCanvas();
  const image = deferred();
  const draw = vi.fn();

  beginRender(canvas);
  void drawWhenLoaded(ctx, image.promise, draw);
  const finished = finishRender(canvas);

  expect(canvas.dataset.rendered).toBe('false');

  image.resolve('image');
  await expect(finished).resolves.toBe(true);
  expect(draw).toHaveBeenCalledWith('image');
  expect(canvas.dataset.rendered).toBe('true');
});

test('waits for the drawings that its drawings start, too', async () => {
  const { canvas, ctx } = setupCanvas();
  const layout = deferred();
  const art = deferred();
  const drawArt = vi.fn();

  beginRender(canvas);
  void drawWhenLoaded(ctx, layout.promise, () => {
    void drawWhenLoaded(ctx, art.promise, drawArt);
  });
  const finished = finishRender(canvas);
  layout.resolve('layout');
  await new Promise((resolve) => setTimeout(resolve, 0));

  expect(canvas.dataset.rendered).toBe('false');

  art.resolve('art');
  await expect(finished).resolves.toBe(true);
  expect(drawArt).toHaveBeenCalledWith('art');
});

test('draws with the transform the context had when asked to draw', async () => {
  const { canvas, ctx } = setupCanvas();
  const image = deferred();
  const transformsDrawnWith: string[] = [];

  beginRender(canvas);
  ctx.currentTransform = 'rotated';
  void drawWhenLoaded(ctx, image.promise, () => transformsDrawnWith.push(ctx.currentTransform));
  ctx.currentTransform = 'identity';
  image.resolve('image');
  await finishRender(canvas);

  expect(transformsDrawnWith).toEqual(['rotated']);
  expect(ctx.restore).toHaveBeenCalled();
});

test('a drawing that fails to load does not block the render', async () => {
  const { canvas, ctx } = setupCanvas();

  beginRender(canvas);
  void drawWhenLoaded(ctx, Promise.reject(new Error('Image not found')), vi.fn()).catch(() => {});

  await expect(finishRender(canvas)).resolves.toBe(true);
  expect(canvas.dataset.rendered).toBe('true');
});

test('drawings from a render replaced by a newer one are skipped', async () => {
  const { canvas, ctx } = setupCanvas();
  const oldImage = deferred();
  const drawOld = vi.fn();

  beginRender(canvas);
  void drawWhenLoaded(ctx, oldImage.promise, drawOld);
  const oldRender = finishRender(canvas);

  beginRender(canvas);
  const drawNew = vi.fn();
  void drawWhenLoaded(ctx, Promise.resolve('new image'), drawNew);
  const newRender = finishRender(canvas);

  oldImage.resolve('old image');
  await expect(oldRender).resolves.toBe(false);
  await expect(newRender).resolves.toBe(true);
  expect(drawOld).not.toHaveBeenCalled();
  expect(drawNew).toHaveBeenCalledWith('new image');
});

describe('whenRendered', () => {
  afterEach(() => vi.useRealTimers());

  test('resolves right away for canvases that are rendered or not tracked', async () => {
    const { canvas } = setupCanvas();
    await expect(whenRendered(canvas, 1000)).resolves.toBe(true);

    canvas.dataset.rendered = 'true';
    await expect(whenRendered(canvas, 1000)).resolves.toBe(true);
  });

  test('waits until the canvas finishes rendering', async () => {
    const { canvas } = setupCanvas();
    canvas.dataset.rendered = 'false';

    const waiting = whenRendered(canvas, 1000);
    canvas.dataset.rendered = 'true';

    await expect(waiting).resolves.toBe(true);
  });

  test('gives up after the timeout', async () => {
    vi.useFakeTimers();
    const { canvas } = setupCanvas();
    canvas.dataset.rendered = 'false';

    const waiting = whenRendered(canvas, 1000);
    vi.advanceTimersByTime(1000);

    await expect(waiting).resolves.toBe(false);
  });
});

// jsdom has no canvas contexts, and drawWhenLoaded only needs the canvas
// The context's transform is a plain value: what it's set to, until set again
const setupCanvas = () => {
  const canvas = document.createElement('canvas');
  const ctx = {
    canvas,
    currentTransform: 'identity',
    getTransform: () => ctx.currentTransform,
    setTransform: (transform: string) => {
      ctx.currentTransform = transform;
    },
    save: vi.fn(),
    restore: vi.fn(),
  };
  return { canvas, ctx: ctx as unknown as CanvasRenderingContext2D & { currentTransform: string } };
};
