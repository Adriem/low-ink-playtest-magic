import { useMemo, useRef } from 'react';
import type { ScryfallCard } from '../types/cards';
import { fetchCardData } from '../utils/scryfall';

/**
 * Card lookup API backed by a cache. Cards are cached by name, including
 * lookups still in flight, so each name is fetched only once. Failed lookups
 * are not cached, so they are fetched again on the next call.
 *
 * @returns Stable API object. `findCardByName` resolves with the cached card
 *   or fetches it, and rejects if the card cannot be fetched.
 */
export const useFetchCard = () => {
  const cacheRef = useRef(new Map<string, Promise<ScryfallCard>>())

  return useMemo(() => ({
    findCardByName: (cardName: string): Promise<ScryfallCard> => {
      const cache = cacheRef.current
      const cached = cache.get(cardName)
      if (cached) return cached

      const cardPromise = fetchCardData(cardName).catch((error) => {
        cache.delete(cardName)
        throw error
      })

      cache.set(cardName, cardPromise)
      return cardPromise
    },
  }), [])
}
