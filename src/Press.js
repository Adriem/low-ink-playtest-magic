import { useCallback, useEffect, useState } from 'react';

import useCardData from './hooks/useCardData';
import Card from './CanvasCard';

import './Press.css';
import exportToPDF from './utils/exportToPdf';

const Press = () => {
  const [multipleSearch, setMultipleSearch] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cardList, setCardList] = useState([]);
  const [cardSheets, setSheets] = useState([]);

  useEffect(() => {
    const _cardList = [...cardList]
    const _cardSheets = [];
    while (_cardList.length) _cardSheets.push(_cardList.splice(0, 9));

    setSheets(_cardSheets);
  }, [cardList]);

  const addCards = useCallback((cards) => {
    setCardList(list => [...list, ...cards]);
  }, [setCardList]);

  const removeCard = useCallback((card) => {
    setCardList(list => list.filter(e => e !== card));
  }, [setCardList])

  const fetchSingleCard = useCallback(async (cardName) => {
    if (!cardName) return;

    const response = await fetch(`https://api.scryfall.com/cards/named?exact=${encodeURIComponent(cardName)}`, {
      headers: { Origin: window.location.origin }
    });

    if (!response.ok) {
      const error = await response.json();
      alert(`Could not fetch the card. Reason: ${error.details}`);
      throw new Error(error.details);
    }

    const cardData = await response.json();

    const cardsToBeAdded = cardData.card_faces
      ? cardData.card_faces.map(face => ({ ...cardData, ...face }))
      : [cardData];

    addCards(cardsToBeAdded);
  }, [addCards, setLoading]);

  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();

    setLoading(true);

    try {
      if (multipleSearch) {
        for (const cardName of
          event.target.cardNamesList.value.replace(/^\d+\s/gm, '').split('\n')) {
          await fetchSingleCard(cardName);
          await new Promise(r => setTimeout(r, 100));
        }
      } else {
        await fetchSingleCard(event.target.cardName.value)
      }
    } finally {
      setLoading(false);
    }
  }, [fetchSingleCard, multipleSearch]);

  const exportPress = useCallback(() => {
    const canvases = document.querySelectorAll('canvas.card');

    exportToPDF(canvases);
  }, [setCardList])

  return (
    <>
      <form className="press-controls" action="#" onSubmit={handleSubmit}>
        {multipleSearch ? (
          <>
            <textarea
              className="card-name-input"
              name="cardNamesList"
              disabled={loading}
              placeholder="e.g. Colossal Dreadmaw"
            />
            <a
              href="#"
              className="toggle-multiple-card-search off"
              onClick={() => setMultipleSearch(false)}
            >
              Change to single card search...
            </a>
            <input
              className="submit-card-search multiple"
              type="submit"
              value={loading ? 'Loading...' : 'Add cards' }
              disabled={loading}
            />
          </>
        ) : (
          <>
            <input
              className="card-name-input"
              name="cardName"
              disabled={loading}
              placeholder="e.g. Colossal Dreadmaw"
            />
            <input
              className="submit-card-search single"
              type="submit"
              value={loading ? 'Loading...' : 'Add card' }
              disabled={loading}
            />
            <a
              href="#"
              className="toggle-multiple-card-search on"
              onClick={() => setMultipleSearch(true)}
            >
              Change to multiple cards search...
            </a>
          </>
        )}
        </form>
      {cardSheets.map((sheet, i) => (
        <div key={i} className="press-sheet">
          {sheet.map(card => (
            <div className="sheet-slot" key={card.multiverse_ids[0]}>
              <button className="sheet-slot-control delete" onClick={() => removeCard(card)} >
                <i className="fa fa-trash" />
              </button>
              <Card
                cardName={card.name}
                cardManaCost={card.mana_cost}
                cardColors={card.colors}
                cardOracleText={card.oracle_text}
                cardTypeLine={card.type_line}
                cardArtUrl={card.image_uris?.art_crop}
                cardLoyalty={card.loyalty}
                cardPower={card.power}
                cardToughness={card.toughness}
                cardSet={card.set.toUpperCase()}
              />
            </div>
          ))}
        </div>
      ))}
      <div>
        <button onClick={exportPress}>EXPORT</button>
      </div>
    </>
  )
};

export default Press;