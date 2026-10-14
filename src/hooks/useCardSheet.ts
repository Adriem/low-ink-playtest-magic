import { useMemo } from 'react';
import { isLoadingCard, type CollectionCard, type CropArt, type ScryfallCard, type SheetCard } from '../types/cards';
import { chunk } from '../utils/array';

/** Cards in each sheet, the same as in each page of the exported PDF (3x3) */
export const CARDS_PER_SHEET = 9;

const SPLIT_LAYOUTS = ['split'];
const DUAL_FACE_LAYOUTS = ['flip', 'transform', 'modal_dfc', 'meld', 'reversible_card', 'double_faced_token'];
const SUBCARD_LAYOUTS = ['adventure', 'prepare'];

// Split cards have the art of both faces side by side in a single image,
// first face on the left. Aftermath cards are excluded: their arts don't take
// half of the image each.
const ART_HALVES: CropArt[] = ['left-half', 'right-half'];
const hasSideBySideArt = (card: ScryfallCard) => SPLIT_LAYOUTS.includes(card.layout) && !card.keywords?.includes('Aftermath');
const getCropArt = (card: ScryfallCard, faceIndex: number) => (hasSideBySideArt(card) ? ART_HALVES[faceIndex] : undefined);

/** Whether split or double-faced cards are kept as a single card or split into one card per face */
export type CardTreatment = 'unified' | 'separate';

interface SheetConfig {
  /** Amount of cards in each sheet */
  sheetSize?: number;
  splitCardTreatment?: CardTreatment;
  doubleFacedCardTreatment?: CardTreatment;
}

/**
 * Group the cards of a collection into sheets. Depending on the settings,
 * split and double-faced cards are kept as a single card or split into one
 * card per face.
 *
 * @param cards - Cards in the collection
 */
export const groupCardsIntoSheets = (cards: CollectionCard[], {
  sheetSize = CARDS_PER_SHEET,
  splitCardTreatment = 'separate',
  doubleFacedCardTreatment = 'separate',
}: SheetConfig = {}): SheetCard[][] => {
  const sheetCards = cards
    .map((card, collectionIndex): SheetCard => ({ ...card, _collectionIndex: collectionIndex }))
    .flatMap((card): SheetCard[] => {
      if (isLoadingCard(card) || !card.card_faces) return [card];

      if (SUBCARD_LAYOUTS.includes(card.layout)) {
        const { card_faces, ...cardWithoutFaces } = card;
        return [{ ...cardWithoutFaces, ...card_faces[0], _subFace: card_faces[1] }];
      }

      const treatment = SPLIT_LAYOUTS.includes(card.layout)
        ? splitCardTreatment
        : DUAL_FACE_LAYOUTS.includes(card.layout)
          ? doubleFacedCardTreatment
          : 'separate';

      // Split and flip cards have their art on the card rather than on each face
      if (treatment === 'unified') {
        const faces = card.card_faces.map((face, faceIndex) => ({
          image_uris: card.image_uris,
          ...face,
          _cropArt: getCropArt(card, faceIndex),
        }));
        return [{ ...card, card_faces: faces }];
      }

      const { card_faces, ...cardWithoutFaces } = card;
      return card_faces.map((face, faceIndex) => ({
        ...cardWithoutFaces,
        ...face,
        _faceIndex: faceIndex,
        _cropArt: getCropArt(card, faceIndex),
      }));
    });
  return chunk(sheetCards, sheetSize);
};

/**
 * Memoized {@link groupCardsIntoSheets}.
 */
export const useCardSheet = (cards: CollectionCard[], { sheetSize, splitCardTreatment, doubleFacedCardTreatment }: SheetConfig = {}) => {
  return useMemo(
    () => groupCardsIntoSheets(cards, { sheetSize, splitCardTreatment, doubleFacedCardTreatment }),
    [cards, sheetSize, splitCardTreatment, doubleFacedCardTreatment],
  );
};
