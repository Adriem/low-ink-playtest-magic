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
 * @returns {{
 *   cards: Object<string, Card>,
 *   requestCard: function(cardName: string): void,
 * }} Cards fetched so far, keyed by name, and a stable function to request a
 *    card (requests for already fetched or pending cards are ignored)
 */
export const useFetchCard = () => {
  const pendingCardsRef = useRef([])

  const [state, dispatch] = useReducer((prevState, { type, cardName, payload }) => {
    switch (type) {
    case 'CARD_LOADED':
      return {
        ...prevState,
        [cardName]: {
          ...payload,
          _loading: false,
          _error: null,
        },
      };
    case 'CARD_ERROR':
      return {
        ...prevState,
        [cardName]: {
          ...(prevState[cardName] || {}),
          _loading: false,
          _error: payload,
        },
      };
    default:
      return prevState;
    }
  }, {});

  const requestCard = useCallback((cardName) => {
    if (pendingCardsRef.current.includes(cardName)) return

    pendingCardsRef.current.push(cardName)

    fetchCardData(cardName)
      .then(cardData => dispatch({ type: 'CARD_LOADED', cardName, payload: cardData }))
      .catch(error => dispatch({ type: 'CARD_ERROR', cardName, payload: error }))
  }, [])

  return { cards: state, requestCard }
}
