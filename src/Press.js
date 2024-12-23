import { useCallback, useEffect, useState } from 'react';

import Card from './cards/realistic/RealisticCard';
// import Card from './cards/minimal/MinimalCard';
import DualCard from './cards/minimal/DualMinimalCard';

import './Press.css';
import { useCardSheet } from './hooks/useCardSheet';
import exportToPDF from './utils/exportToPdf';

const CARDS_PER_SHEET = 9
const MERGE_DUAL_FACE_CARDS = false;

const Press = () => {
  const [multipleSearch, setMultipleSearch] = useState(false);
  const [cardNamesList, setCardNamesList] = useState([]);
  const cardSheets = useCardSheet(cardNamesList, CARDS_PER_SHEET);

  const addCards = useCallback((cards) => {
    setCardNamesList(list => [...list, ...cards]);
  }, [setCardNamesList]);

  const removeCard = useCallback((sheetNumber, cardPosition) => {
    setCardNamesList(list => {
      const _list = [...list]
      _list.splice((sheetNumber * CARDS_PER_SHEET) + cardPosition, 1)
      return _list
    });
  }, [setCardNamesList])

  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();

    const cardNames = multipleSearch
      ? event.target.cardNamesList.value.replace(/^\d+\s/gm, '').split('\n')
      : [event.target.cardName.value]

    addCards(cardNames)
  }, [multipleSearch]);

  const exportPress = useCallback(() => {
    const canvases = document.querySelectorAll('canvas.card');

    exportToPDF(canvases);
  }, [setCardNamesList])

  const calculateCardKey = (cardsInSheet, card, position) => {
    const cardId = card.multiverse_ids[0]
    const cardOccurrenceInSheet = cardsInSheet
      .slice(0, position)
      .filter(c => c.multiverse_ids[0] === cardId)
      .length

    return `${cardId}__${cardOccurrenceInSheet}`
  }

  return (
    <>
      <form className="press-controls" action="#" onSubmit={handleSubmit}>
        {multipleSearch ? (
          <>
            <textarea
              className="card-name-input"
              name="cardNamesList"
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
              value="Add cards"
            />
          </>
        ) : (
          <>
            <input
              className="card-name-input"
              name="cardName"
              placeholder="e.g. Colossal Dreadmaw"
            />
            <input
              className="submit-card-search single"
              type="submit"
              value="Add card"
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
      {cardSheets.map((sheet, sheetNumber) => (
        <div key={sheetNumber} className="press-sheet">
          {sheet.map((card, cardPosition) => (
            <div className="sheet-slot" key={card._loading ? `loading_${cardPosition}` : calculateCardKey(sheet, card, cardPosition)}>
              <button className="sheet-slot-control delete" onClick={() => removeCard(sheetNumber, cardPosition)} >
                <i className="fa fa-trash" />
              </button>
              {card._loading ? (
                <div>LOADING</div>
              ) : MERGE_DUAL_FACE_CARDS ? (
                  <DualCard
                      cardFaces={card.card_faces}
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
              ) : (
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
              )}
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
