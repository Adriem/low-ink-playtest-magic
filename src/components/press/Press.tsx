import { useCallback, useEffect } from 'react';

import Card from '../cards/Card';
import DualCard from '../cards/DualCard';
import LoadingCard from '../cards/LoadingCard';
import CardSearchForm from './CardSearchForm';
import { CardOverlayProvider } from './CardOverlayContext';
import PressActions from './PressActions';
import SheetSlot from './SheetSlot';
import { useSetting } from '../settings';

import './Press.css';
import { exportToPDF, type PdfExportOptions } from '../../adapters/jspdf';
import { whenRendered } from '../cards/common/canvasRendering';
import { useCardCollection } from '../../hooks/useCardCollection';
import { useCardSheet } from '../../hooks/useCardSheet';
import { useKeyedRefs } from '../../hooks/useKeyedRefs';
import { loadFromStorage, saveToStorage } from '../../utils/storage';
import { isLoadingCard, type CollectionCard, type SheetItem } from '../../domain/press';

const CARD_COLLECTION_STORAGE_KEY = 'press:cardCollection';

// Maximum time to wait for cards to finish rendering (e.g. slow images)
const RENDER_TIMEOUT_MS = 10000;

const Press = () => {
  const [cardVariant] = useSetting('cardVariant');
  const [splitCardTreatment] = useSetting('splitCardTreatment');
  const [doubleFacedCardTreatment] = useSetting('doubleFacedCardTreatment');
  const [inkLevel] = useSetting('inkLevel');
  const [artFidelity] = useSetting('artFidelity');
  const { cardCollection, addCardByName, removeCardAt, moveCard, clearCollection } = useCardCollection({
    initialCards: loadPersistedCards,
    onCardLoadError: handleCardLoadError,
  });
  const cardSheets = useCardSheet(cardCollection, {
    splitCardTreatment,
    doubleFacedCardTreatment,
  });
  // Keys of the items of each sheet, by sheet
  const sheetKeys = cardSheets.map((sheet, sheetNumber) =>
    sheet.map((item, position) => `${sheetNumber}:${calculateItemKey(sheet, item, position)}`),
  );
  const cardCanvases = useKeyedRefs<HTMLCanvasElement>();

  useEffect(() => {
    const loadedCards = cardCollection.filter((card) => !isLoadingCard(card));
    saveToStorage(sessionStorage, CARD_COLLECTION_STORAGE_KEY, loadedCards);
  }, [cardCollection]);

  const handleAddCards = useCallback(
    (cardNames: string[]) => {
      cardNames.forEach((cardName) => addCardByName(cardName));
    },
    [addCardByName],
  );

  const handleClear = useCallback(() => {
    clearCollection();
  }, [clearCollection]);

  // The canvases of the cards in the sheets, in order (loading cards have none)
  const handleExport = (options: PdfExportOptions) => {
    const canvases = sheetKeys.flat().flatMap((key) => cardCanvases.get(key) ?? []);

    void exportCardsToPdf(canvases, options);
  };

  return (
    <>
      <CardSearchForm onAddCards={handleAddCards} />
      {cardSheets.length > 0 && <PressActions onClear={handleClear} onExport={handleExport} />}
      <CardOverlayProvider collectionSize={cardCollection.length} moveCard={moveCard} removeCardAt={removeCardAt}>
        {cardSheets.map((sheet, sheetNumber) => (
          <section key={sheetNumber} className="press-page">
            <div className="press-sheet">
              {sheet.map((item, position) => (
                <SheetSlot
                  key={sheetKeys[sheetNumber][position]}
                  collectionIndex={item.collectionIndex}
                  face={item.kind === 'face' ? item.sheetFace : 'single'}
                  cardName={
                    item.kind === 'loading' ? 'loading card' : item.kind === 'face' ? item.face.name : item.card.name
                  }
                >
                  {item.kind === 'loading' ? (
                    <LoadingCard />
                  ) : item.kind === 'faces' ? (
                    <DualCard
                      cardStyle={cardVariant}
                      faces={item.faces}
                      inkLevel={inkLevel}
                      artFidelity={artFidelity}
                      ref={cardCanvases.refFor(sheetKeys[sheetNumber][position])}
                    />
                  ) : (
                    <Card
                      cardStyle={cardVariant}
                      face={item.face}
                      subFace={item.subFace}
                      subFacePosition={item.subFacePosition}
                      inkLevel={inkLevel}
                      artFidelity={artFidelity}
                      ref={cardCanvases.refFor(sheetKeys[sheetNumber][position])}
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
const exportCardsToPdf = async (canvases: HTMLCanvasElement[], options: PdfExportOptions) => {
  const rendered = await Promise.all(canvases.map((canvas) => whenRendered(canvas, RENDER_TIMEOUT_MS)));
  if (rendered.includes(false)) console.warn('Exporting before every card finished rendering');

  exportToPDF(canvases, options);
};

const loadPersistedCards = () => {
  return loadFromStorage<CollectionCard[]>(sessionStorage, CARD_COLLECTION_STORAGE_KEY, [], Array.isArray);
};

// TODO: Replace alert with a toast notification
const handleCardLoadError = (cardName: string, error: Error) => {
  window.alert(`Could not load "${cardName}": ${error.message}`);
};

// Cards keep their key while moved around, so their canvases aren't drawn again
const calculateItemKey = (sheet: SheetItem[], item: SheetItem, position: number) => {
  if (item.kind === 'loading') return `loading_${item.loadingCardId}`;

  const cardId = item.card.multiverseIds[0];
  const cardOccurrenceInSheet = sheet
    .slice(0, position)
    .filter((previous) => previous.kind !== 'loading' && previous.card.multiverseIds[0] === cardId).length;

  return `${cardId}__${cardOccurrenceInSheet}`;
};

export default Press;
