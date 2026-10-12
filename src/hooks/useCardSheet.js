import { useEffect, useMemo } from 'react';
import { useFetchCard } from './useFetchCard';

const SPLIT_LAYOUTS = ['split'];
const DUAL_FACE_LAYOUTS = ['flip', 'transform', 'modal_dfc', 'meld', 'reversible_card', 'double_faced_token'];
const SUBCARD_LAYOUTS = ['adventure', 'prepare'];
const LOADING_CARD = { _loading: true, _error: null };

/**
 * @typedef {object} Card
 * @prop {boolean} _loading
 * @prop {Error|null} _error
 * @prop {number} _sourceIndex - Index of the card name this card was built from
 * @prop {string} mana_cost
 * @prop {string} colors
 * @prop {string} oracle_text
 * @prop {string} type_line
 * @prop {string} set
 * @prop {string[]} multiverse_ids
 * @prop {{art_crop: string}} [image_uris]
 * @prop {string} [power]
 * @prop {string} [toughness]
 * @prop {string} [loyalty]
 */

/**
 * Create an array of card sheets from a list of card names. Data will be
 * fetched from Scryfall.io
 *
 * @param {string[]} cardNames - List of the cards to be included in the sheet
 * @param {number} sheetSize - Amount of cards to be included in the sheet
 * @returns {{
 *   cardSheets: Card[][],
 *   errors: import('./useFetchCard').CardError[],
 * }} Card sheets, and the cards that could not be fetched
 */
export const useCardSheet = (cardNames, sheetSize = 9, { splitCardTreatment = 'separate', doubleFacedCardTreatment = 'separate' } = {}) => {
  const { cards, errors, requestCard } = useFetchCard();

  useEffect(() => {
    cardNames.forEach(requestCard);
  }, [cardNames, requestCard]);

  const cardSheets = useMemo(() => {
    const cardsData = cardNames
      .map((cardName, sourceIndex) => ({ ...(cards[cardName] ?? LOADING_CARD), _sourceIndex: sourceIndex }))
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

        if (treatment === 'unified') return [card];

        const { card_faces, ...cardWithoutFaces } = card;
        return card_faces.map(face => ({ ...cardWithoutFaces, ...face }));
      });
    const cardSheets = []

    while (cardsData.length) cardSheets.push(cardsData.splice(0, sheetSize));

    return cardSheets;
  }, [cardNames, cards, sheetSize, splitCardTreatment, doubleFacedCardTreatment]);

  return { cardSheets, errors };
};
