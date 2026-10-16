import { useState, useEffect } from 'react';
import { fetchCardData, toCard } from '../../adapters/scryfall';
import type { Card } from '../../domain/cards';

interface CardDataResult {
  cardName: string | null;
  card: Card | null;
  /** Scryfall's image of the whole card, to compare the drawn card with */
  referenceImageUrl?: string;
  error: Error | null;
}

const useCardData = (cardName: string) => {
  // The card name the card and error are for; it's loading until they're for the current one
  const [result, setResult] = useState<CardDataResult>({ cardName: null, card: null, error: null });

  useEffect(() => {
    if (!cardName) return;

    let ignore = false;
    void fetchCardData(cardName)
      .then((data) => {
        if (ignore) return;
        setResult({
          cardName,
          error: null,
          card: toCard(data),
          referenceImageUrl: data.image_uris?.normal ?? data.card_faces?.[0].image_uris?.normal,
        });
      })
      .catch((error: Error) => {
        if (ignore) return;
        setResult((previous) => ({ ...previous, cardName, error }));
      });

    return () => {
      ignore = true;
    };
  }, [cardName]);

  const loading = Boolean(cardName) && result.cardName !== cardName;

  return { card: result.card, referenceImageUrl: result.referenceImageUrl, loading, error: result.error };
};

export default useCardData;
