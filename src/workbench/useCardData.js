import { useState, useEffect } from 'react';
import { fetchCardData } from '../utils/scryfall';

const SUBCARD_LAYOUTS = ['adventure', 'prepare'];

const useCardData = (cardName) => {
  // The card name the data and error are for; it's loading until they're for the current one
  const [result, setResult] = useState({ cardName: null, cardData: {}, error: null });

  useEffect(() => {
    if (!cardName) return;

    let ignore = false;
    void fetchCardData(cardName)
      .then(data => {
        if (ignore) return;
        setResult({
          cardName,
          error: null,
          cardData: data.card_faces
            ? {
                ...data,
                ...data.card_faces[0],
                reverse_name: data.card_faces[1].name,
                ...(SUBCARD_LAYOUTS.includes(data.layout) ? { _subFace: data.card_faces[1] } : {})
              }
            : data,
        });
      })
      .catch(error => {
        if (ignore) return;
        setResult(previous => ({ ...previous, cardName, error }));
      });

    return () => {
      ignore = true;
    };
  }, [cardName]);

  const loading = Boolean(cardName) && result.cardName !== cardName;

  return { cardData: result.cardData, loading, error: result.error };
};

export default useCardData;
