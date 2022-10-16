import { useMemo, useCallback, useReducer, useRef } from 'react';
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
 * @returns {function(cardName: string): Promise<Card>}
 */
export const useFetchCard = () => {
  const pendingCardsRef = useRef([])

  const [state, dispatch] = useReducer((prevState, { type, cardName, payload }) => {
    switch (type) {
    case 'CARD_LOADED':
      console.log('CARD_LOADED', type, cardName, payload)
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

  return useMemo(() => console.log('Re-rendering memo') || (async (cardName) => {
    // TODO: OPTIMISE CACHING TO AVOID UNNECESSARY RE-RENDERS
    if (state[cardName] != null) return state[cardName]

    if (!pendingCardsRef.current.includes(cardName)) {
      pendingCardsRef.current.push(cardName)

      fetchCardData(cardName)
        .then(cardData => dispatch({ type: 'CARD_LOADED', cardName, payload: cardData }))
        .catch(error => dispatch({ type: 'CARD_ERROR', cardName, payload: error }))
    }

    return { _loading: true, _error: null }
  }), [state])
}