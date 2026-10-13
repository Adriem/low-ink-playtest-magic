/**
 * Track when a canvas has finished rendering.
 *
 * Card renderers draw most of a card synchronously, but images (art, mana
 * symbols) load asynchronously and are drawn later. Each render registers that
 * asynchronous drawing here, so it's possible to know when the whole card has
 * been drawn. While rendering, the canvas has `data-rendered="false"`, and
 * `data-rendered="true"` once done.
 */

/** @type {WeakMap<HTMLCanvasElement, { pendingDrawings: Promise<void>[] }>} */
const renders = new WeakMap();

/**
 * Start a new render of the canvas. Drawings from previous renders that are
 * still pending are discarded.
 *
 * @param {HTMLCanvasElement} canvas
 */
export const beginRender = (canvas) => {
  renders.set(canvas, { pendingDrawings: [] });
  canvas.dataset.rendered = 'false';
};

/**
 * Draw something once it has loaded, as part of the current render of the
 * canvas. Skipped if a newer render started in the meantime.
 *
 * @template T
 * @param {CanvasRenderingContext2D} ctx
 * @param {Promise<T>} loading - e.g. an image being loaded
 * @param {function(loaded: T): void} draw
 * @returns {Promise<void>}
 */
export const drawWhenLoaded = (ctx, loading, draw) => {
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
 * @param {HTMLCanvasElement} canvas
 * @returns {Promise<boolean>} Whether this is still the current render, i.e.
 *   no newer render started while waiting
 */
export const finishRender = async (canvas) => {
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
 * @param {HTMLCanvasElement} canvas
 * @param {number} timeout - Maximum time to wait, in milliseconds
 * @returns {Promise<boolean>} Whether it finished rendering before the timeout
 */
export const whenRendered = (canvas, timeout) => new Promise((resolve) => {
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

/**
 * Load an image that can be drawn on a canvas and read back (e.g. by filters
 * or the PDF export).
 *
 * @param {string} src
 * @returns {Promise<HTMLImageElement>}
 */
export const loadImage = (src) => new Promise((resolve, reject) => {
  const image = new Image();
  image.crossOrigin = 'Anonymous';
  image.onload = () => resolve(image);
  image.onerror = reject;
  image.src = src;
});
