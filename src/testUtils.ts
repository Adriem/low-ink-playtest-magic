import { FULL_ART_CROP, type Card, type CardFace } from './domain/cards';
import type { Flag } from './utils/flags';

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
    orientation: 'portrait',
    typeLine: '',
    colors: [],
    oracleText: { lines: [] },
    art: { crop: FULL_ART_CROP },
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

/** Turn a flag on or off, until the test ends (setupTests turns them back off) */
export const overrideFlag = (name: Flag, value: boolean) => {
  Object.assign(window.flags, { [name]: value });
};

/** Turn a flag, or every flag, back off, as tests start */
export const resetFlag = (name?: Flag) => {
  const names = name ? [name] : (Object.keys(window.flags) as Flag[]);
  names.forEach((flag) => Object.assign(window.flags, { [flag]: false }));
};
