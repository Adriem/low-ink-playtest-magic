import { useState } from 'react';

interface KeyedRefs<T> {
  /** Callback ref for the element with the given key, the same one on every call */
  refFor: (key: string) => (element: T | null) => void;
  /** Element with the given key, while it's mounted */
  get: (key: string) => T | undefined;
}

/**
 * Refs to a list of elements, by key, e.g. the items of a list.
 */
export const useKeyedRefs = <T>(): KeyedRefs<T> => {
  const [keyedRefs] = useState(createKeyedRefs<T>);
  return keyedRefs;
};

const createKeyedRefs = <T>(): KeyedRefs<T> => {
  const elements = new Map<string, T>();
  const callbacks = new Map<string, (element: T | null) => void>();

  const refFor = (key: string) => {
    const existing = callbacks.get(key);
    if (existing) return existing;

    const callback = (element: T | null) => {
      if (element) {
        elements.set(key, element);
      } else {
        elements.delete(key);
        callbacks.delete(key);
      }
    };
    callbacks.set(key, callback);
    return callback;
  };

  return { refFor, get: (key) => elements.get(key) };
};
