import { useCallback, useEffect, useRef } from 'react';

import Card from '../cards/Card';
import DualCard from '../cards/DualCard';
import LoadingCard from '../cards/LoadingCard';
import CardSearchForm from './CardSearchForm';
import { CardOverlayProvider } from './CardOverlayContext';
import SheetSlot from './SheetSlot';
import { SettingsPanel, useSetting } from '../settings';

import './Press.css';
import { exportToPDF } from '../../adapters/jspdf';
import { whenRendered } from '../cards/common/canvasRendering';
import { useCardCollection } from '../../hooks/useCardCollection';
import { useCardSheet } from '../../hooks/useCardSheet';
import { loadFromSessionStorage, saveToSessionStorage } from '../../utils/sessionStorage';
import { isLoadingCard, type CollectionCard, type SheetItem } from '../../domain/press';

const CARD_COLLECTION_STORAGE_KEY = 'press:cardCollection';

// Maximum time to wait for cards to finish rendering (e.g. slow images)
const RENDER_TIMEOUT_MS = 10000;

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
  const settingsDialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const loadedCards = cardCollection.filter((card) => !isLoadingCard(card));
    saveToSessionStorage(CARD_COLLECTION_STORAGE_KEY, loadedCards);
  }, [cardCollection]);

  const openSettings = useCallback(() => {
    settingsDialogRef.current?.showModal();
  }, []);

  const handleAddCards = useCallback(
    (cardNames: string[]) => {
      cardNames.forEach((cardName) => addCardByName(cardName));
    },
    [addCardByName],
  );

  // While moving a card (mouse only), the overlay stays on it: hovering other
  // cards or leaving it doesn't change it, only closing it does
  const exportPress = useCallback(() => {
    const canvases = [...document.querySelectorAll<HTMLCanvasElement>('canvas.card')];

    void exportCardsToPdf(canvases);
  }, []);

  // Cards keep their key while moved around, so their canvases aren't drawn again
  const calculateItemKey = (sheet: SheetItem[], item: SheetItem, position: number) => {
    if (item.kind === 'loading') return `loading_${item.loadingCardId}`;

    const cardId = item.card.multiverseIds[0];
    const cardOccurrenceInSheet = sheet
      .slice(0, position)
      .filter((previous) => previous.kind !== 'loading' && previous.card.multiverseIds[0] === cardId).length;

    return `${cardId}__${cardOccurrenceInSheet}`;
  };

  return (
    <>
      <CardSearchForm onAddCards={handleAddCards} />
      {cardSheets.length > 0 && (
        <div className="press-actions">
          <button type="button" className="clear" onClick={clearCollection}>
            Clear
          </button>
          <button type="button" onClick={openSettings}>
            Settings
          </button>
          <button type="button" className="export" onClick={exportPress}>
            EXPORT
          </button>
        </div>
      )}
      <SettingsPanel ref={settingsDialogRef} />
      <CardOverlayProvider collectionSize={cardCollection.length} moveCard={moveCard} removeCardAt={removeCardAt}>
        {cardSheets.map((sheet, sheetNumber) => (
          <section key={sheetNumber} className="press-page">
            <div className="press-sheet">
              {sheet.map((item, position) => (
                <SheetSlot
                  key={calculateItemKey(sheet, item, position)}
                  collectionIndex={item.collectionIndex}
                  face={item.kind === 'face' ? item.sheetFace : 'single'}
                  cardName={
                    item.kind === 'loading' ? 'loading card' : item.kind === 'face' ? item.face.name : item.card.name
                  }
                >
                  {item.kind === 'loading' ? (
                    <LoadingCard />
                  ) : item.kind === 'faces' ? (
                    <DualCard cardStyle={cardVariant} faces={item.faces} />
                  ) : (
                    <Card
                      cardStyle={cardVariant}
                      face={item.face}
                      subFace={item.subFace}
                      subFacePosition={item.subFacePosition}
                    />
                  )}
                </SheetSlot>
              ))}
            </div>
            <footer className="press-page-footer">
              Page {sheetNumber + 1} of {cardSheets.length}
            </footer>
          </section>
        ))}
      </CardOverlayProvider>
    </>
  );
};

/**
 * Export the cards to a PDF once they're completely drawn, so images still
 * loading aren't missing from it.
 */
const exportCardsToPdf = async (canvases: HTMLCanvasElement[]) => {
  const rendered = await Promise.all(canvases.map((canvas) => whenRendered(canvas, RENDER_TIMEOUT_MS)));
  if (rendered.includes(false)) console.warn('Exporting before every card finished rendering');

  exportToPDF(canvases);
};

const loadPersistedCards = () => {
  return loadFromSessionStorage<CollectionCard[]>(CARD_COLLECTION_STORAGE_KEY, [], Array.isArray);
};

// TODO: Replace alert with a toast notification
const handleCardLoadError = (cardName: string, error: Error) => {
  window.alert(`Could not load "${cardName}": ${error.message}`);
};

export default Press;
