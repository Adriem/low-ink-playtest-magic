import { useMemo } from 'react';
import { chunk } from '../utils/array';

/** Cards in each sheet, the same as in each page of the exported PDF (3x3) */
export const CARDS_PER_SHEET = 9;

const SPLIT_LAYOUTS = ['split'];
const DUAL_FACE_LAYOUTS = ['flip', 'transform', 'modal_dfc', 'meld', 'reversible_card', 'double_faced_token'];
const SUBCARD_LAYOUTS = ['adventure', 'prepare'];

// Split cards have the art of both faces side by side in a single image,
// first face on the left. Aftermath cards are excluded: their arts don't take
// half of the image each.
const ART_HALVES = ['left-half', 'right-half'];
const hasSideBySideArt = (card) => SPLIT_LAYOUTS.includes(card.layout) && !card.keywords?.includes('Aftermath');
const getCropArt = (card, faceIndex) => (hasSideBySideArt(card) ? ART_HALVES[faceIndex] : undefined);

/**
 * @typedef {import('./useCardCollection').CollectionCard & {
 *   _collectionIndex: number,
 *   _faceIndex?: number,
 *   _cropArt?: 'left-half'|'right-half',
 *   _subFace?: object,
 * }} SheetCard - A collection card (or one of its faces) placed in a sheet.
 *   `_collectionIndex` is the index of the collection card it comes from, and
 *   `_faceIndex` the index of the face when the card is split into faces, and
 *   `_cropArt` which part of the card's art image belongs to the face.
 */

/**
 * Group the cards of a collection into sheets. Depending on the settings,
 * split and double-faced cards are kept as a single card or split into one
 * card per face.
 *
 * @param {import('./useCardCollection').CollectionCard[]} cards - Cards in the collection
 * @param {object} [config]
 * @param {number} [config.sheetSize] - Amount of cards in each sheet
 * @param {'unified'|'separate'} [config.splitCardTreatment]
 * @param {'unified'|'separate'} [config.doubleFacedCardTreatment]
 * @returns {SheetCard[][]}
 */
export const groupCardsIntoSheets = (cards, {
  sheetSize = CARDS_PER_SHEET,
  splitCardTreatment = 'separate',
  doubleFacedCardTreatment = 'separate',
} = {}) => {
  const sheetCards = cards
    .map((card, collectionIndex) => ({ ...card, _collectionIndex: collectionIndex }))
    .flatMap(card => {
      if (!card.card_faces) return [card];

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
 *
 * @param {import('./useCardCollection').CollectionCard[]} cards
 * @param {Parameters<typeof groupCardsIntoSheets>[1]} [config]
 * @returns {SheetCard[][]}
 */
export const useCardSheet = (cards, { sheetSize, splitCardTreatment, doubleFacedCardTreatment } = {}) => {
  return useMemo(
    () => groupCardsIntoSheets(cards, { sheetSize, splitCardTreatment, doubleFacedCardTreatment }),
    [cards, sheetSize, splitCardTreatment, doubleFacedCardTreatment],
  );
};
