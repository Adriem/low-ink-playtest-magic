import { useState, useEffect } from 'react';
import { useFetchCard } from './useFetchCard';

/**
 * @typedef {object} Card
 * @prop {boolean} _loading
 * @prop {Error|null} _error
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
 * @returns {Card[][]}
 */
export const useCardSheet = (cardNames, sheetSize = 9) => {
  const fetchCardData = useFetchCard();
  const [cardSheets, setSheets] = useState([[]]);

  useEffect(() => {
    const buildCardSheets = async () => {
      const cardsData = (await Promise.all(cardNames.map((cardName) => fetchCardData(cardName))))
        .filter(card => card._error == null)
        .flatMap(card => card.card_faces ? card.card_faces.map(face => ({ ...card, ...face})) : [card]);
      const cardSheets = []

      while (cardsData.length) cardSheets.push(cardsData.splice(0, sheetSize));

      setSheets(cardSheets);
    };

    buildCardSheets()
  }, [cardNames, fetchCardData]);

  return cardSheets;
};