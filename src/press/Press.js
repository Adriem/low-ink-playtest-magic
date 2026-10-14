import { useCallback, useEffect, useRef } from 'react';

import Card from '../cards/Card';
import DualCard from '../cards/DualCard';
import CardSearchForm from './CardSearchForm';
import { CardOverlayProvider } from './CardOverlayContext';
import SheetSlot from './SheetSlot';
import { SettingsPanel, useSetting } from '../settings';

import './Press.css';
import { useCardCollection } from '../hooks/useCardCollection';
import { useCardSheet } from '../hooks/useCardSheet';
import exportToPDF from '../utils/exportToPdf';
import { loadFromSessionStorage, saveToSessionStorage } from '../utils/sessionStorage';

const CARD_COLLECTION_STORAGE_KEY = 'press:cardCollection';

const loadPersistedCards = () => loadFromSessionStorage(CARD_COLLECTION_STORAGE_KEY, [], Array.isArray);

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
    splitCardTreatment,
    doubleFacedCardTreatment,
  });
  const settingsDialogRef = useRef(null);

  useEffect(() => {
    const loadedCards = cardCollection.filter(card => !card._loading);
    saveToSessionStorage(CARD_COLLECTION_STORAGE_KEY, loadedCards);
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

    void exportToPDF(canvases);
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
      <CardOverlayProvider collectionSize={cardCollection.length} moveCard={moveCard} removeCardAt={removeCardAt}>
        {cardSheets.map((sheet, sheetNumber) => (
          <section key={sheetNumber} className="press-page">
            <div className="press-sheet">
              {sheet.map((card, cardPosition) => {
                const { _collectionIndex: collectionIndex } = card;
                const face = card._faceIndex == null ? 'single' : card._faceIndex === 0 ? 'main' : 'secondary';

                return (
                  <SheetSlot
                    key={card._loading ? `loading_${card._loadingCardId}` : calculateCardKey(sheet, card, cardPosition)}
                    collectionIndex={collectionIndex}
                    face={face}
                    cardName={card._loading ? 'loading card' : card.name}
                  >
                    {card._loading ? (
                      <div>LOADING</div>
                    ) : card.card_faces ? (
                      <DualCard
                        cardStyle={cardVariant}
                        cardFaces={card.card_faces}
                        cardSet={card.set.toUpperCase()}
                      />
                    ) : (
                      <Card
                        cardStyle={cardVariant}
                        cardName={card.name}
                        cardManaCost={card.mana_cost}
                        cardColors={card.colors}
                        cardOracleText={card.oracle_text}
                        cardTypeLine={card.type_line}
                        cardArtUrl={card.image_uris?.art_crop}
                        cropArt={card._cropArt}
                        cardLoyalty={card.loyalty}
                        cardPower={card.power}
                        cardToughness={card.toughness}
                        cardSet={card.set.toUpperCase()}
                        subCardPosition={card._subFace ? (card.layout === 'prepare' ? 'right' : 'left') : null}
                        subCard={card._subFace}
                      />
                    )}
                  </SheetSlot>
                );
              })}
            </div>
            <footer className="press-page-footer">
              Page {sheetNumber + 1} of {cardSheets.length}
            </footer>
          </section>
        ))}
      </CardOverlayProvider>
    </>
  )
};

export default Press;
