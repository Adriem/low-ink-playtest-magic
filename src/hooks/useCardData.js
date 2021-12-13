const { useState, useEffect } = require('react');

const useCardData = (cardName) => {
  const [cardData, setCardData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!cardName) return;

    setLoading(true);

    fetch(`https://api.scryfall.com/cards/named?exact=${encodeURIComponent(cardName)}`)
      .then(async r => r.ok ? await r.json() : Promise.reject(await r.json()))
      .then(data => {
        setLoading(false);
        setError(null);
        setCardData(data);
      })
      .catch(error => {
        setLoading(false);
        setError(error);
      });
  }, [cardName]);

  return { cardData, loading, error };
};

export default useCardData;