import type { ScryfallCard } from './types/cards';

export interface Deferred<T> {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason?: unknown) => void;
}

/** A promise along with the functions that settle it */
export const deferred = <T = unknown>(): Deferred<T> => {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
};

/** A Scryfall card for tests, with placeholders for the fields a test doesn't care about */
export const testCard = (card: Partial<ScryfallCard> & { name: string }): ScryfallCard => ({
  layout: 'normal',
  set: 'tst',
  multiverse_ids: [],
  ...card,
});
