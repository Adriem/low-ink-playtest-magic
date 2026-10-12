const { useState, useEffect } = require('react');

const SUBCARD_LAYOUTS = ['adventure', 'prepare'];

const useCardData = (cardName) => {
  const [cardData, setCardData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!cardName) return;

    setLoading(true);

    fetch(`https://api.scryfall.com/cards/named?exact=${encodeURIComponent(cardName)}`, {
      headers: { Origin: window.location.origin }
    })
      .then(async r => r.ok ? await r.json() : Promise.reject(await r.json()))
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