// The testing-library rules mistake functions with "render" in their name
// (finishRender, whenRendered) for testing-library's render
/* eslint-disable testing-library/render-result-naming-convention */
import { deferred } from '../testUtils';
import { beginRender, drawWhenLoaded, finishRender, whenRendered } from './canvasRendering';

// jsdom has no canvas contexts, and drawWhenLoaded only needs the canvas
const setupCanvas = () => {
  const canvas = document.createElement('canvas');
  return { canvas, ctx: { canvas } as CanvasRenderingContext2D };
};

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
