import type { Card, CardFace } from './domain/cards';

export interface Deferred<T> {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason?: unknown) => void;
}

/** A promise along with the functions that settle it */
export const deferred = <T = unknown>(): Deferred<T> => {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

/** A card face for tests, with placeholders for the fields a test doesn't care about */
export const testFace = (face: Partial<CardFace> & { name: string }): CardFace => {
  return {
    faceLayout: 'regular',
    typeLine: '',
    colors: [],
    oracleText: { paragraphs: [] },
    art: { crop: 'full' },
    ...face,
  };
};

/** A card for tests, with a single face named like it unless given its faces */
export const testCard = (card: Partial<Card> & { name: string }): Card => {
  return {
    layout: 'normal',
    set: 'tst',
    multiverseIds: [],
    mainFace: testFace({ name: card.name }),
    ...card,
  };
};
