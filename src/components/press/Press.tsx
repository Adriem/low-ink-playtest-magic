import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Card from '../cards/Card';
import DualCard from '../cards/DualCard';
import LoadingCard from '../cards/LoadingCard';
import BackToTopButton from './BackToTopButton';
import CardLoadErrors from './CardLoadErrors';
import CardSearchForm from './CardSearchForm';
import { CardOverlayProvider } from './CardOverlayContext';
import PressActions from './PressActions';
import SheetSlot from './SheetSlot';
import { useSetting, useCardPalette } from '../settings';
import { useFlag } from '../../hooks/useFlag';

import './Press.css';
import { exportToPDF, type PdfExportOptions } from '../../adapters/jspdf';
import { whenRendered } from '../cards/common/canvasRendering';
import { useCardCollection } from '../../hooks/useCardCollection';
import { useCardSheet } from '../../hooks/useCardSheet';
import { useKeyedRefs } from '../../hooks/useKeyedRefs';
import { loadFromStorage, saveToStorage, type StorageKey } from '../../utils/storage';
import { isLoadingCard, type CollectionCard, type SheetItem } from '../../domain/press';

const CARD_COLLECTION_STORAGE_KEY: StorageKey = 'press:CARD_COLLECTION@1';

// Maximum time to wait for cards to finish rendering (e.g. slow images)
const RENDER_TIMEOUT_MS = 10000;

const Press = () => {
  const { t } = useTranslation();
  // The back to top button shows once the search form is scrolled away
  const searchFormRef = useRef<HTMLDivElement>(null);

  const [cardVariant] = useSetting('cardVariant');
  const [doubleFacedCardTreatment] = useSetting('doubleFacedCardTreatment');
  const [inkLevel] = useSetting('inkLevel');
  const hasArtFidelitySlider = useFlag('ART_FIDELITY_SLIDER');
  const [artFidelity] = useSetting(hasArtFidelitySlider ? 'artFidelity' : 'includeArt');
  const [cardCorners] = useSetting('cardCorners');
  const [cardBorder] = useSetting('cardBorder');

  const customPalette = useCardPalette(cardVariant);

  // Names of the cards of the last cards added that couldn't be loaded
  const [failedCardNames, setFailedCardNames] = useState<string[]>([]);

  const handleCardLoadError = useCallback((cardName: string) => {
    setFailedCardNames((names) => (names.includes(cardName) ? names : [...names, cardName]));
  }, []);

  const { cardCollection, addCardByName, removeCardAt, moveCard, clearCollection } = useCardCollection({
    initialCards: loadPersistedCards,
    onCardLoadError: handleCardLoadError,
  });
  const cardSheets = useCardSheet(cardCollection, { doubleFacedCardTreatment });
  // Keys of the items of each sheet, by sheet
  const sheetKeys = cardSheets.map((sheet, sheetNumber) =>
    sheet.map((item, position) => `${sheetNumber}:${calculateItemKey(sheet, item, position)}`),
  );
  const cardCanvases = useKeyedRefs<HTMLCanvasElement>();

  useEffect(() => {
    const loadedCards = cardCollection.filter((card) => !isLoadingCard(card));
    saveToStorage('sessionStorage', CARD_COLLECTION_STORAGE_KEY, loadedCards);
  }, [cardCollection]);

  const handleAddCards = useCallback(
    (cardNames: string[]) => {
      setFailedCardNames([]);
      cardNames.forEach((cardName) => addCardByName(cardName));
    },
    [addCardByName],
  );

  const handleCardLoadErrorsDismiss = useCallback(() => {
    setFailedCardNames([]);
  }, []);

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
      <div ref={searchFormRef} className="container">
        <CardSearchForm onAddCards={handleAddCards} />
        {failedCardNames.length > 0 && (
          <CardLoadErrors cardNames={failedCardNames} onDismiss={handleCardLoadErrorsDismiss} />
        )}
      </div>
      {cardSheets.length > 0 && <PressActions onClear={handleClear} onExport={handleExport} />}
      <CardOverlayProvider collectionSize={cardCollection.length} moveCard={moveCard} removeCardAt={removeCardAt}>
        {cardSheets.map((sheet, sheetNumber) => (
          <section key={sheetNumber} className={`press-page ${cardCorners}-corners`}>
            <div className="press-sheet-scroller">
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
                        blackBordered={cardBorder === 'full'}
                        outlined={cardBorder === 'outline'}
                        roundedCorners={cardCorners === 'rounded'}
                        inkLevel={inkLevel}
                        customPalette={customPalette}
                        artFidelity={artFidelity}
                        ref={cardCanvases.refFor(sheetKeys[sheetNumber][position])}
                      />
                    ) : (
                      <Card
                        cardStyle={cardVariant}
                        face={item.face}
                        subFace={item.subFace}
                        subFacePosition={item.subFacePosition}
                        blackBordered={cardBorder === 'full'}
                        outlined={cardBorder === 'outline'}
                        roundedCorners={cardCorners === 'rounded'}
                        inkLevel={inkLevel}
                        customPalette={customPalette}
                        artFidelity={artFidelity}
                        ref={cardCanvases.refFor(sheetKeys[sheetNumber][position])}
                      />
                    )}
                  </SheetSlot>
                ))}
              </div>
            </div>
            <footer className="press-page-footer">
              {t('press.page_number', { page: sheetNumber + 1, pages: cardSheets.length })}
            </footer>
          </section>
        ))}
      </CardOverlayProvider>
      <BackToTopButton watched={searchFormRef} />
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
  return loadFromStorage<CollectionCard[]>('sessionStorage', CARD_COLLECTION_STORAGE_KEY, [], Array.isArray);
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
