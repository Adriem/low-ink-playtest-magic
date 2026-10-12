import { useCallback, useReducer, useRef } from 'react';
import { fetchCardData } from '../utils/scryfall';

/**
 * @typedef {object} Card
 * @prop {boolean} _loading
 * @prop {Error|null} _error
 * @prop {string} name
 * @prop {string} cost
 * @prop {string} oracle
 * @prop {string} typeLine
 * @prop {string} [power]
 * @prop {string} [toughness]
 * @prop {string} [loyalty]
 */

/**
 * @typedef {object} CardError
 * @prop {string} cardName
 * @prop {Error} error
 */

// TODO: Revisit naming. Despite the singular name, this hook is a shared cache
// for every card in the press: a single instance (hooks can't be called per
// card in a loop) holds all fetched cards keyed by name plus the failed ones,
// and dedupes requests so each name is fetched once. `requestCard` adds one
// card at a time to it. Consider names like `useCardCache` / `cardsByName`.
/**
 * @returns {{
 *   cards: Object<string, Card>,
 *   errors: CardError[],
 *   requestCard: function(cardName: string): void,
 * }} Cards fetched so far, keyed by name, the cards that could not be fetched,
 *    and a stable function to request a card (requests for already fetched or
 *    pending cards are ignored). Failed cards are not cached, so requesting
 *    them again clears their error and fetches them again.
 */
export const useFetchCard = () => {
  const pendingCardsRef = useRef([])

  const [{ cards, errors }, dispatch] = useReducer((prevState, { type, cardName, payload }) => {
    switch (type) {
    case 'CARD_REQUESTED':
      if (!prevState.errors.some(e => e.cardName === cardName)) return prevState;
      return {
        ...prevState,
        errors: prevState.errors.filter(e => e.cardName !== cardName),
      };
    case 'CARD_LOADED':
      return {
        ...prevState,
        cards: {
          ...prevState.cards,
          [cardName]: {
            ...payload,
            _loading: false,
            _error: null,
          },
        },
      };
    case 'CARD_ERROR':
      return {
        ...prevState,
        errors: [...prevState.errors, { cardName, error: payload }],
      };
    default:
      return prevState;
    }
  }, { cards: {}, errors: [] });

  const requestCard = useCallback((cardName) => {
    if (pendingCardsRef.current.includes(cardName)) return

    pendingCardsRef.current.push(cardName)
    dispatch({ type: 'CARD_REQUESTED', cardName })

    fetchCardData(cardName)
      .then(cardData => dispatch({ type: 'CARD_LOADED', cardName, payload: cardData }))
      .catch(error => {
        pendingCardsRef.current = pendingCardsRef.current.filter(name => name !== cardName)
        dispatch({ type: 'CARD_ERROR', cardName, payload: error })
      })
  }, [])

  return { cards, errors, requestCard }
}
