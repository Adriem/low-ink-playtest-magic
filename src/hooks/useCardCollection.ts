import { useCallback, useRef, useState } from 'react';
import {
  isLoadingCard,
  moveCard as moveCardInCollection,
  type CollectionCard,
  type LoadingCard,
} from '../domain/press';
import { useFetchCard } from './useFetchCard';
import type { Card } from '../domain/cards';

interface CardCollectionOptions {
  /** Cards to start with, or a function that returns them (called once) */
  initialCards?: CollectionCard[] | (() => CollectionCard[]);
  /** Called when a card added by name cannot be loaded */
  onCardLoadError?: (cardName: string, error: Error) => void;
}

/**
 * Manage the collection of cards in the press. Cards are added by name, one
 * or several at once (e.g. a card list, fetched together): a loading
 * placeholder is appended right away and replaced with the card once it
 * loads. If loading fails, the placeholder is removed and `onCardLoadError`
 * is called.
 */
export const useCardCollection = ({ initialCards = [], onCardLoadError }: CardCollectionOptions = {}) => {
  const { findCardByName, findCardsByName } = useFetchCard();
  const [cardCollection, setCardCollection] = useState<CollectionCard[]>(initialCards);
  const nextLoadingCardIdRef = useRef(0);

  // A placeholder for a card, replaced once it loads, or removed if it fails to
  const addLoadingCard = useCallback(
    (cardName: string, cardPromise: Promise<Card>) => {
      const loadingCardId = nextLoadingCardIdRef.current++;
      const isPlaceholder = (card: CollectionCard) => {
        return isLoadingCard(card) && card.loadingCardId === loadingCardId;
      };
      const placeholder: LoadingCard = { loading: true, loadingCardId };

      setCardCollection((collection) => [...collection, placeholder]);

      void cardPromise
        .then((card) => {
          setCardCollection((collection) => collection.map((c) => (isPlaceholder(c) ? card : c)));
        })
        .catch((error: Error) => {
          setCardCollection((collection) => collection.filter((c) => !isPlaceholder(c)));
          onCardLoadError?.(cardName, error);
        });
    },
    [onCardLoadError],
  );

  const addCardByName = useCallback(
    (cardName: string) => {
      addLoadingCard(cardName, findCardByName(cardName));
    },
    [addLoadingCard, findCardByName],
  );

  const addCardsByName = useCallback(
    (cardNames: string[]) => {
      const cardPromises = findCardsByName(cardNames);
      cardNames.forEach((cardName, index) => addLoadingCard(cardName, cardPromises[index]));
    },
    [addLoadingCard, findCardsByName],
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

  /**
   * Change the card at an index, e.g. to override its art. Placeholders of
   * cards still loading can't be edited.
   */
  const editCardAt = useCallback((index: number, edit: (card: Card) => Card) => {
    setCardCollection((collection) =>
      collection.map((card, i) => (i !== index || isLoadingCard(card) ? card : edit(card))),
    );
  }, []);

  return { cardCollection, addCardByName, addCardsByName, removeCardAt, moveCard, clearCollection, editCardAt };
};
