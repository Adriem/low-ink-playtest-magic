import { useMemo, useRef } from 'react';
import { fetchCard, fetchCollection } from '../adapters/scryfall';
import type { Card } from '../domain/cards';

/**
 * Card lookup API backed by a cache. Cards are cached by name, including
 * lookups still in flight, so each name is fetched only once. Failed lookups
 * are not cached, so they are fetched again on the next call.
 *
 * @returns Stable API object. `findCardByName` resolves with the cached card
 *   or fetches it, and rejects if the card cannot be fetched.
 *   `findCardsByName` does the same for several cards (e.g. a card list),
 *   fetching the ones not cached together.
 */
export const useFetchCard = () => {
  const cacheRef = useRef(new Map<string, Promise<Card>>());

  return useMemo(() => {
    const cache = cacheRef.current;
    // Failed lookups leave the cache, to be fetched again
    const cacheCard = (cardName: string, cardPromise: Promise<Card>) => {
      cache.set(
        cardName,
        cardPromise.catch((error) => {
          cache.delete(cardName);
          throw error;
        }),
      );
    };

    return {
      findCardByName: (cardName: string): Promise<Card> => {
        if (!cache.has(cardName)) cacheCard(cardName, fetchCard(cardName));
        return cache.get(cardName)!;
      },
      findCardsByName: (cardNames: string[]): Promise<Card>[] => {
        const missingNames = [...new Set(cardNames.filter((cardName) => !cache.has(cardName)))];
        if (missingNames.length > 0) {
          const fetched = fetchCollection(missingNames);
          missingNames.forEach((cardName, index) => {
            cacheCard(
              cardName,
              fetched.then((cards) => {
                const card = cards[index];
                if (card instanceof Error) throw card;
                return card;
              }),
            );
          });
        }
        return cardNames.map((cardName) => cache.get(cardName)!);
      },
    };
  }, []);
};
