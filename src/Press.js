import { useCallback, useEffect, useRef, useState } from 'react';

import RealisticCard from './cards/realistic/RealisticCard';
import MinimalCard from './cards/minimal/MinimalCard';
import DualCard from './cards/DualCard';
import { SettingsPanel, useSetting } from './settings';

import './Press.css';
import { useCardCollection } from './hooks/useCardCollection';
import { useCardSheet } from './hooks/useCardSheet';
import exportToPDF from './utils/exportToPdf';

const CARDS_PER_SHEET = 9
const CARD_COLLECTION_STORAGE_KEY = 'press:cardCollection';

const loadPersistedCards = () => {
  try {
    const raw = sessionStorage.getItem(CARD_COLLECTION_STORAGE_KEY);
    if (raw == null) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

// TODO: Replace alert with a toast notification
const alertCardLoadError = (cardName, error) => {
  window.alert(`Could not load "${cardName}": ${error.message}`);
};

const Press = () => {
  const [multipleSearch, setMultipleSearch] = useState(false);
  const [cardVariant] = useSetting('cardVariant');
  const [splitCardTreatment] = useSetting('splitCardTreatment');
  const [doubleFacedCardTreatment] = useSetting('doubleFacedCardTreatment');
  const { cardCollection, addCardByName, removeCardAt, clearCollection } = useCardCollection({
    initialCards: loadPersistedCards,
    onCardLoadError: alertCardLoadError,
  });
  const cardSheets = useCardSheet(cardCollection, {
    sheetSize: CARDS_PER_SHEET,
    splitCardTreatment,
    doubleFacedCardTreatment,
  });
  const settingsDialogRef = useRef(null);

  const Card = cardVariant === 'minimalist' ? MinimalCard : RealisticCard;

  useEffect(() => {
    const loadedCards = cardCollection.filter(card => !card._loading);
    sessionStorage.setItem(CARD_COLLECTION_STORAGE_KEY, JSON.stringify(loadedCards));
  }, [cardCollection]);

  const openSettings = useCallback(() => {
    settingsDialogRef.current?.showModal();
  }, []);

  const handleSubmit = useCallback((event) => {
    event.preventDefault();

    const cardNames = multipleSearch
      ? event.target.cardNamesList.value.replace(/^\d+\s/gm, '').split('\n')
      : [event.target.cardName.value]

    cardNames
      .map(cardName => cardName.trim())
      .filter(Boolean)
      .forEach(addCardByName)
  }, [multipleSearch, addCardByName]);

  const exportPress = useCallback(() => {
    const canvases = document.querySelectorAll('canvas.card');

    exportToPDF(canvases);
  }, [])

  const calculateCardKey = (cardsInSheet, card, position) => {
    const cardId = card.multiverse_ids[0]
    const cardOccurrenceInSheet = cardsInSheet
      .slice(0, position)
      .filter(c => c.multiverse_ids[0] === cardId)
      .length

    return `${cardId}__${cardOccurrenceInSheet}`
  }

  const searchModeToggle = (
    <div
      className={`search-mode ${multipleSearch ? 'list' : 'single'}`}
      role="radiogroup"
      aria-labelledby="search-mode-label"
    >
      <span id="search-mode-label">Search mode:</span>
      <label>
        <input
          type="radio"
          name="searchMode"
          value="single"
          checked={!multipleSearch}
          onChange={() => setMultipleSearch(false)}
        />
        single card
      </label>
      <label>
        <input
          type="radio"
          name="searchMode"
          value="list"
          checked={multipleSearch}
          onChange={() => setMultipleSearch(true)}
        />
        card list
      </label>
    </div>
  );

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
            {/* Invisible copy of the submit button that keeps the toggle centered */}
            <input
              className="submit-card-search multiple ghost"
              type="button"
              value="Add cards"
              tabIndex={-1}
              aria-hidden="true"
            />
            {searchModeToggle}
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
            {searchModeToggle}
          </>
        )}
        </form>
      {cardSheets.length > 0 && (
        <div className="press-actions">
          <button type="button" className="clear" onClick={clearCollection}>Clear</button>
          <button type="button" onClick={openSettings}>Settings</button>
          <button type="button" className="export" onClick={exportPress}>EXPORT</button>
        </div>
      )}
      <SettingsPanel ref={settingsDialogRef} />
      {cardSheets.map((sheet, sheetNumber) => (
        <div key={sheetNumber} className="press-sheet">
          {sheet.map((card, cardPosition) => (
            <div className="sheet-slot" key={card._loading ? `loading_${card._loadingCardId}` : calculateCardKey(sheet, card, cardPosition)}>
              <button className="sheet-slot-control delete" onClick={() => removeCardAt(card._collectionIndex)} >
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
