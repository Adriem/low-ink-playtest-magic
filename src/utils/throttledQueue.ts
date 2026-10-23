/**
 * Queue of async functions run in order, their starts spaced apart, e.g. to
 * keep requests to an API within its rate limit. A function doesn't wait for
 * the previous one to finish, only for its turn.
 */
export interface ThrottledQueue {
  readonly requestSpacingMillis: number;
  /** Functions waiting for their turn, next first */
  waiting: (() => void)[];
  /** When the next function can start */
  nextRunAt: number;
  /** Timer of the next function's turn, while one is waiting */
  timer?: ReturnType<typeof setTimeout>;
}

/**
 * Create a queue whose functions start at least `requestSpacingMillis` apart.
 */
export const create = (requestSpacingMillis: number): ThrottledQueue => {
  return { requestSpacingMillis, waiting: [], nextRunAt: 0 };
};

/**
 * Schedule a function to run after the others waiting.
 *
 * @returns What the function returns, once it's run
 */
export const push = <T>(queue: ThrottledQueue, func: () => Promise<T>): Promise<T> => {
  return schedule(queue, func, 'last');
};

/**
 * Schedule a function to run next, before the others waiting, e.g. to retry
 * one that failed.
 *
 * @returns What the function returns, once it's run
 */
export const unshift = <T>(queue: ThrottledQueue, func: () => Promise<T>): Promise<T> => {
  return schedule(queue, func, 'next');
};

/**
 * Hold off the next function for some time from now, e.g. while an API blocks
 * requests. Functions already running carry on.
 */
export const pauseFor = (queue: ThrottledQueue, millis: number) => {
  queue.nextRunAt = Math.max(queue.nextRunAt, Date.now() + millis);
};

/**
 * Add a function to the queue, settling the promise returned with what it
 * returns.
 */
const schedule = <T>(queue: ThrottledQueue, func: () => Promise<T>, position: 'next' | 'last'): Promise<T> => {
  return new Promise<T>((resolve, reject) => {
    const run = () => {
      void func().then(resolve, reject);
    };
    if (position === 'next') queue.waiting.unshift(run);
    else queue.waiting.push(run);
    scheduleNext(queue);
  });
};

/**
 * Wait for the next function's turn, unless it's already waiting or there's
 * none.
 */
const scheduleNext = (queue: ThrottledQueue) => {
  if (queue.timer != null || queue.waiting.length === 0) return;

  queue.timer = setTimeout(() => runNext(queue), Math.max(0, queue.nextRunAt - Date.now()));
};

/**
 * Run the next function, and wait for the turn of the one after it. If the
 * queue was paused while waiting, wait until the pause ends.
 */
const runNext = (queue: ThrottledQueue) => {
  queue.timer = undefined;
  if (Date.now() < queue.nextRunAt) {
    scheduleNext(queue);
    return;
  }

  const run = queue.waiting.shift();
  if (!run) return;

  queue.nextRunAt = Date.now() + queue.requestSpacingMillis;
  run();
  scheduleNext(queue);
};
