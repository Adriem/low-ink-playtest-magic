import { useCallback, useEffect, useRef, useState } from 'react';

import RealisticCard from './cards/realistic/RealisticCard';
import MinimalCard from './cards/minimal/MinimalCard';
import DualCard from './cards/DualCard';
import { SettingsPanel, useSetting } from './settings';

import './Press.css';
import { useCardSheet } from './hooks/useCardSheet';
import exportToPDF from './utils/exportToPdf';

const CARDS_PER_SHEET = 9
const CARD_NAMES_STORAGE_KEY = 'press:cardNamesList';

const loadPersistedCardNames = () => {
  try {
    const raw = sessionStorage.getItem(CARD_NAMES_STORAGE_KEY);
    if (raw == null) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const Press = () => {
  const [multipleSearch, setMultipleSearch] = useState(false);
  const [cardVariant] = useSetting('cardVariant');
  const [splitCardTreatment] = useSetting('splitCardTreatment');
  const [doubleFacedCardTreatment] = useSetting('doubleFacedCardTreatment');
  const [cardNamesList, setCardNamesList] = useState(loadPersistedCardNames);
  const { cardSheets, errors } = useCardSheet(cardNamesList, CARDS_PER_SHEET, { splitCardTreatment, doubleFacedCardTreatment });
  const settingsDialogRef = useRef(null);

  const Card = cardVariant === 'minimalist' ? MinimalCard : RealisticCard;

  useEffect(() => {
    sessionStorage.setItem(CARD_NAMES_STORAGE_KEY, JSON.stringify(cardNamesList));
  }, [cardNamesList]);

  useEffect(() => {
    const failedCardNames = errors.map(({ cardName }) => cardName);

    setCardNamesList(list => list.some(name => failedCardNames.includes(name))
      ? list.filter(name => !failedCardNames.includes(name))
      : list);
  }, [errors]);

  const openSettings = useCallback(() => {
    settingsDialogRef.current?.showModal();
  }, []);

  const clearCards = useCallback(() => {
    setCardNamesList([]);
  }, [setCardNamesList]);

  const addCards = useCallback((cards) => {
    setCardNamesList(list => [...list, ...cards]);
  }, [setCardNamesList]);

  const removeCard = useCallback((sourceIndex) => {
    setCardNamesList(list => {
      const _list = [...list]
      _list.splice(sourceIndex, 1)
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
      {cardSheets.length > 0 && (
        <div className="press-actions">
          <button type="button" className="clear" onClick={clearCards}>Clear</button>
          <button type="button" onClick={openSettings}>Settings</button>
          <button type="button" className="export" onClick={exportPress}>EXPORT</button>
        </div>
      )}
      <SettingsPanel ref={settingsDialogRef} />
      {cardSheets.map((sheet, sheetNumber) => (
        <div key={sheetNumber} className="press-sheet">
          {sheet.map((card, cardPosition) => (
            <div className="sheet-slot" key={card._loading ? `loading_${cardPosition}` : calculateCardKey(sheet, card, cardPosition)}>
              <button className="sheet-slot-control delete" onClick={() => removeCard(card._sourceIndex)} >
                <i className="fa fa-trash" />
              </button>
              {card._loading ? (
                <div>LOADING</div>
              ) : card.card_faces ? (
                <DualCard
                  Card={Card}
                  cardFaces={card.card_faces}
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
                  subCardPosition={card._subFace ? (card.layout === 'prepare' ? 'right' : 'left') : null}
                  subCard={card._subFace}
                />
              )}
            </div>
          ))}
        </div>
      ))}
    </>
  )
};

export default Press;
