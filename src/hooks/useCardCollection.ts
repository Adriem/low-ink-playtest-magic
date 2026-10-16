import { useCallback, useRef, useState } from 'react';
import {
  isLoadingCard,
  moveCard as moveCardInCollection,
  type CollectionCard,
  type LoadingCard,
} from '../domain/press';
import { useFetchCard } from './useFetchCard';

interface CardCollectionOptions {
  /** Cards to start with, or a function that returns them (called once) */
  initialCards?: CollectionCard[] | (() => CollectionCard[]);
  /** Called when a card added by name cannot be loaded */
  onCardLoadError?: (cardName: string, error: Error) => void;
}

/**
 * Manage the collection of cards in the press. Cards are added by name: a
 * loading placeholder is appended right away and replaced with the card once
 * it loads. If loading fails, the placeholder is removed and `onCardLoadError`
 * is called.
 */
export const useCardCollection = ({ initialCards = [], onCardLoadError }: CardCollectionOptions = {}) => {
  const { findCardByName } = useFetchCard();
  const [cardCollection, setCardCollection] = useState<CollectionCard[]>(initialCards);
  const nextLoadingCardIdRef = useRef(0);

  const addCardByName = useCallback(
    (cardName: string) => {
      const loadingCardId = nextLoadingCardIdRef.current++;
      const isPlaceholder = (card: CollectionCard) => {
        return isLoadingCard(card) && card.loadingCardId === loadingCardId;
      };
      const placeholder: LoadingCard = { loading: true, loadingCardId };

      setCardCollection((collection) => [...collection, placeholder]);

      void findCardByName(cardName)
        .then((card) => {
          setCardCollection((collection) => collection.map((c) => (isPlaceholder(c) ? card : c)));
        })
        .catch((error: Error) => {
          setCardCollection((collection) => collection.filter((c) => !isPlaceholder(c)));
          onCardLoadError?.(cardName, error);
        });
    },
    [findCardByName, onCardLoadError],
  );

  const removeCardAt = useCallback((index: number) => {
    setCardCollection((collection) => collection.filter((_card, i) => i !== index));
  }, []);

  /**
   * Move the card at `fromIndex` so it ends up at `toIndex`. Moves outside the
   * collection are ignored.
   */
  const moveCard = useCallback((fromIndex: number, toIndex: number) => {
    setCardCollection((collection) => moveCardInCollection(collection, fromIndex, toIndex));
  }, []);

  const clearCollection = useCallback(() => {
    setCardCollection([]);
  }, []);

  return { cardCollection, addCardByName, removeCardAt, moveCard, clearCollection };
};
