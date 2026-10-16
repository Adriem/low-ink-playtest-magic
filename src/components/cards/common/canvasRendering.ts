/**
 * Track when a canvas has finished rendering.
 *
 * Card renderers draw most of a card synchronously, but images (art, mana
 * symbols) load asynchronously and are drawn later. Each render registers that
 * asynchronous drawing here, so it's possible to know when the whole card has
 * been drawn. While rendering, the canvas has `data-rendered="false"`, and
 * `data-rendered="true"` once done.
 */

const renders = new WeakMap<HTMLCanvasElement, { pendingDrawings: Promise<void>[] }>();

/**
 * Start a new render of the canvas. Drawings from previous renders that are
 * still pending are discarded.
 */
export const beginRender = (canvas: HTMLCanvasElement) => {
  renders.set(canvas, { pendingDrawings: [] });
  canvas.dataset.rendered = 'false';
};

/**
 * Draw something once it has loaded, as part of the current render of the
 * canvas. Skipped if a newer render started in the meantime.
 *
 * @param loading - e.g. an image being loaded
 */
export const drawWhenLoaded = <T>(
  ctx: CanvasRenderingContext2D,
  loading: Promise<T>,
  draw: (loaded: T) => void,
): Promise<void> => {
  const render = renders.get(ctx.canvas);

  const drawing = loading.then((loaded) => {
    if (render && renders.get(ctx.canvas) !== render) return;
    draw(loaded);
  });

  render?.pendingDrawings.push(drawing);
  return drawing;
};

/**
 * Wait for the drawings of the current render to finish (or fail, so a missing
 * image doesn't block it), then mark the canvas as rendered.
 *
 * @returns Whether this is still the current render, i.e. no newer render
 *   started while waiting
 */
export const finishRender = async (canvas: HTMLCanvasElement): Promise<boolean> => {
  const render = renders.get(canvas);
  if (!render) return true;

  await Promise.allSettled(render.pendingDrawings);

  const isCurrentRender = renders.get(canvas) === render;
  if (isCurrentRender) canvas.dataset.rendered = 'true';
  return isCurrentRender;
};

/**
 * Wait until the canvas has finished rendering. Canvases that don't track
 * their rendering are considered rendered.
 *
 * @param timeout - Maximum time to wait, in milliseconds
 * @returns Whether it finished rendering before the timeout
 */
export const whenRendered = (canvas: HTMLCanvasElement, timeout: number) => {
  return new Promise<boolean>((resolve) => {
    if (canvas.dataset.rendered !== 'false') {
      resolve(true);
      return;
    }

    const observer = new MutationObserver(() => {
      if (canvas.dataset.rendered === 'false') return;
      stopWaiting();
      resolve(true);
    });
    const timer = setTimeout(() => {
      stopWaiting();
      resolve(false);
    }, timeout);
    const stopWaiting = () => {
      observer.disconnect();
      clearTimeout(timer);
    };

    observer.observe(canvas, { attributes: true, attributeFilter: ['data-rendered'] });
  });
};

/**
 * Load an image that can be drawn on a canvas and read back (e.g. by filters
 * or the PDF export).
 */
export const loadImage = (src: string) => {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'Anonymous';
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
};

/**
 * The 2D context of a canvas, which every supported browser provides.
 */
export const get2dContext = (canvas: HTMLCanvasElement): CanvasRenderingContext2D => {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('The browser does not support drawing on canvases');
  return ctx;
};
