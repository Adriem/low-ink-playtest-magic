import { create, pauseFor, push, unshift } from './throttledQueue';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

/** A function that records its name when it runs */
const task = (name: string, ran: string[]) => {
  return async () => {
    ran.push(name);
  };
};

test('runs the functions in order, their starts spaced apart', async () => {
  const queue = create(500);
  const ran: string[] = [];
  void push(queue, task('first', ran));
  void push(queue, task('second', ran));

  expect(ran).toEqual([]);

  await vi.advanceTimersByTimeAsync(0);
  expect(ran).toEqual(['first']);

  await vi.advanceTimersByTimeAsync(499);
  expect(ran).toEqual(['first']);

  await vi.advanceTimersByTimeAsync(1);
  expect(ran).toEqual(['first', 'second']);
});

test('settles with what the function returns, or why it failed', async () => {
  const queue = create(100);
  const answer = push(queue, async () => 42);
  const failure = push(queue, () => Promise.reject(new Error('Nope')));
  const failed = expect(failure).rejects.toThrow('Nope');

  await vi.advanceTimersByTimeAsync(100);

  await expect(answer).resolves.toBe(42);
  await failed;
});

test("doesn't wait for a function to finish to start the next one", async () => {
  const queue = create(100);
  const ran: string[] = [];
  void push(queue, () => new Promise<void>(() => {}));
  void push(queue, task('second', ran));

  await vi.advanceTimersByTimeAsync(100);

  expect(ran).toEqual(['second']);
});

test('runs functions scheduled with unshift before the others waiting', async () => {
  const queue = create(100);
  const ran: string[] = [];
  void push(queue, task('first', ran));
  void push(queue, task('last', ran));
  void unshift(queue, task('next', ran));

  await vi.advanceTimersByTimeAsync(200);

  expect(ran).toEqual(['next', 'first', 'last']);
});

test('holds off the next function while paused, also if it was already waiting', async () => {
  const queue = create(100);
  const ran: string[] = [];
  void push(queue, task('first', ran));
  void push(queue, task('second', ran));
  await vi.advanceTimersByTimeAsync(0);

  pauseFor(queue, 1_000);
  await vi.advanceTimersByTimeAsync(999);
  expect(ran).toEqual(['first']);

  await vi.advanceTimersByTimeAsync(1);
  expect(ran).toEqual(['first', 'second']);
});

test('runs a function scheduled after the others finished as soon as its turn comes', async () => {
  const queue = create(500);
  const ran: string[] = [];
  void push(queue, task('first', ran));
  await vi.advanceTimersByTimeAsync(2_000);

  void push(queue, task('later', ran));
  await vi.advanceTimersByTimeAsync(0);

  expect(ran).toEqual(['first', 'later']);
});
