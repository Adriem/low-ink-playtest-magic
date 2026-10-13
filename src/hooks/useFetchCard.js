import { useMemo, useRef } from 'react';
import { fetchCardData } from '../utils/scryfall';

/**
 * @typedef {object} ScryfallCard
 * @prop {string} name
 * @prop {string} layout
 * @prop {string} mana_cost
 * @prop {string[]} colors
 * @prop {string} oracle_text
 * @prop {string} type_line
 * @prop {string} set
 * @prop {string[]} multiverse_ids
 * @prop {{art_crop: string}} [image_uris]
 * @prop {object[]} [card_faces]
 * @prop {string} [power]
 * @prop {string} [toughness]
 * @prop {string} [loyalty]
 */

/**
 * Card lookup API backed by a cache. Cards are cached by name, including
 * lookups still in flight, so each name is fetched only once. Failed lookups
 * are not cached, so they are fetched again on the next call.
 *
 * @returns {{
 *   findCardByName: function(cardName: string): Promise<ScryfallCard>,
 * }} Stable API object. `findCardByName` resolves with the cached card or
 *    fetches it, and rejects if the card cannot be fetched.
 */
export const useFetchCard = () => {
  const cacheRef = useRef(new Map())

  return useMemo(() => ({
    findCardByName: (cardName) => {
      const cache = cacheRef.current

      if (!cache.has(cardName)) {
        const cardPromise = fetchCardData(cardName).catch((error) => {
          cache.delete(cardName)
          throw error
        })

        cache.set(cardName, cardPromise)
      }

      return cache.get(cardName)
    },
  }), [])
}
