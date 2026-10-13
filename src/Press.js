import { useCallback, useEffect, useRef } from 'react';

import RealisticCard from './cards/realistic/RealisticCard';
import MinimalCard from './cards/minimal/MinimalCard';
import DualCard from './cards/DualCard';
import CardSearchForm from './CardSearchForm';
import SheetSlotOverlay from './SheetSlotOverlay';
import { SettingsPanel, useSetting } from './settings';

import './Press.css';
import { useCardCollection } from './hooks/useCardCollection';
import { useCardOverlay } from './hooks/useCardOverlay';
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
const handleCardLoadError = (cardName, error) => {
  window.alert(`Could not load "${cardName}": ${error.message}`);
};

const Press = () => {
  const [cardVariant] = useSetting('cardVariant');
  const [splitCardTreatment] = useSetting('splitCardTreatment');
  const [doubleFacedCardTreatment] = useSetting('doubleFacedCardTreatment');
  const { cardCollection, addCardByName, removeCardAt, moveCard, clearCollection } = useCardCollection({
    initialCards: loadPersistedCards,
    onCardLoadError: handleCardLoadError,
  });
  const cardSheets = useCardSheet(cardCollection, {
    sheetSize: CARDS_PER_SHEET,
    splitCardTreatment,
    doubleFacedCardTreatment,
  });
  const settingsDialogRef = useRef(null);
  const { getSlotProps, getCardButtonProps, getOverlayProps } = useCardOverlay({
    collectionSize: cardCollection.length,
    moveCard,
    removeCardAt,
  });

  const Card = cardVariant === 'minimalist' ? MinimalCard : RealisticCard;

  useEffect(() => {
    const loadedCards = cardCollection.filter(card => !card._loading);
    sessionStorage.setItem(CARD_COLLECTION_STORAGE_KEY, JSON.stringify(loadedCards));
  }, [cardCollection]);

  const openSettings = useCallback(() => {
    settingsDialogRef.current?.showModal();
  }, []);

  const handleAddCards = useCallback((cardNames) => {
    cardNames.forEach(cardName => addCardByName(cardName));
  }, [addCardByName]);

  // While moving a card (mouse only), the overlay stays on it: hovering other
  // cards or leaving it doesn't change it, only closing it does
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

  return (
    <>
      <CardSearchForm onAddCards={handleAddCards} />
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
          {sheet.map((card, cardPosition) => {
            const { _collectionIndex: collectionIndex } = card;
            const face = card._faceIndex == null ? 'single' : card._faceIndex === 0 ? 'main' : 'secondary';

            return (
              <div
                className="sheet-slot"
                key={card._loading ? `loading_${card._loadingCardId}` : calculateCardKey(sheet, card, cardPosition)}
                {...getSlotProps(collectionIndex)}
              >
                {/* Opens the card's menu when tapped or activated from the keyboard */}
                <button
                  type="button"
                  className="sheet-slot-card-button"
                  aria-label={`Actions for ${card._loading ? 'loading card' : card.name}`}
                  {...getCardButtonProps(collectionIndex, { isMainFace: face !== 'secondary' })}
                />
                <SheetSlotOverlay face={face} {...getOverlayProps(collectionIndex)} />
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
            );
          })}
        </div>
      ))}
    </>
  )
};

export default Press;
