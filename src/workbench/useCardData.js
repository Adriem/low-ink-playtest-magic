import { useState, useEffect } from 'react';
import { fetchCardData } from '../utils/scryfall';

const SUBCARD_LAYOUTS = ['adventure', 'prepare'];

const useCardData = (cardName) => {
  const [cardData, setCardData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!cardName) return;

    setLoading(true);

    void fetchCardData(cardName)
      .then(data => {
        setLoading(false);
        setError(null);
        setCardData(data.card_faces
          ? {
              ...data,
              ...data.card_faces[0],
              reverse_name: data.card_faces[1].name,
              ...(SUBCARD_LAYOUTS.includes(data.layout) ? { _subFace: data.card_faces[1] } : {})
            }
          : data);
      })
      .catch(error => {
        setLoading(false);
        setError(error);
      });
  }, [cardName]);

  return { cardData, loading, error };
};

export default useCardData;