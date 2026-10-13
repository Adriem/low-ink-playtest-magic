import { useCallback, useRef, useState } from 'react';
import { useFetchCard } from './useFetchCard';

export const LOADING_CARD = { _loading: true };

/**
 * @typedef {object} LoadingCard
 * @prop {true} _loading
 * @prop {number} _loadingCardId - Identifies the placeholder until its card loads
 */

/**
 * @typedef {import('./useFetchCard').ScryfallCard | LoadingCard} CollectionCard
 */

/**
 * Manage the collection of cards in the press. Cards are added by name: a
 * loading placeholder is appended right away and replaced with the card once
 * it loads. If loading fails, the placeholder is removed and `onCardLoadError`
 * is called.
 *
 * @param {object} [options]
 * @param {CollectionCard[]|function(): CollectionCard[]} [options.initialCards] -
 *   Cards to start with, or a function that returns them (called once)
 * @param {function(cardName: string, error: Error): void} [options.onCardLoadError] -
 *   Called when a card added by name cannot be loaded
 * @returns {{
 *   cardCollection: CollectionCard[],
 *   addCardByName: function(cardName: string): void,
 *   removeCardAt: function(index: number): void,
 *   moveCard: function(fromIndex: number, toIndex: number): void,
 *   clearCollection: function(): void,
 * }}
 */
export const useCardCollection = ({ initialCards = [], onCardLoadError } = {}) => {
  const { findCardByName } = useFetchCard();
  const [cardCollection, setCardCollection] = useState(initialCards);
  const nextLoadingCardIdRef = useRef(0);
  const onCardLoadErrorRef = useRef(onCardLoadError);
  onCardLoadErrorRef.current = onCardLoadError;

  const addCardByName = useCallback((cardName) => {
    const loadingCardId = nextLoadingCardIdRef.current++;
    const isPlaceholder = (card) => card._loadingCardId === loadingCardId;

    setCardCollection(collection => [...collection, { ...LOADING_CARD, _loadingCardId: loadingCardId }]);

    findCardByName(cardName)
      .then((card) => {
        setCardCollection(collection => collection.map(c => isPlaceholder(c) ? card : c));
      })
      .catch((error) => {
        setCardCollection(collection => collection.filter(c => !isPlaceholder(c)));
        onCardLoadErrorRef.current?.(cardName, error);
      });
  }, [findCardByName]);

  const removeCardAt = useCallback((index) => {
    setCardCollection(collection => collection.filter((_card, i) => i !== index));
  }, []);

  /**
   * Move the card at `fromIndex` so it ends up at `toIndex`. Moves outside the
   * collection are ignored.
   */
  const moveCard = useCallback((fromIndex, toIndex) => {
    setCardCollection((collection) => {
      const isInCollection = (index) => index >= 0 && index < collection.length;
      if (fromIndex === toIndex || !isInCollection(fromIndex) || !isInCollection(toIndex)) return collection;

      const reordered = [...collection];
      const [card] = reordered.splice(fromIndex, 1);
      reordered.splice(toIndex, 0, card);
      return reordered;
    });
  }, []);

  const clearCollection = useCallback(() => {
    setCardCollection([]);
  }, []);

  return { cardCollection, addCardByName, removeCardAt, moveCard, clearCollection };
};
