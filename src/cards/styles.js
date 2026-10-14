import { renderMinimalistCard } from './minimalist/render';
import { renderRealisticCard } from './realistic/render';

export const CARD_WIDTH = 500;
export const CARD_HEIGHT = 700;

/**
 * @typedef {object} CardProps - What a card style draws
 * @prop {string} cardName
 * @prop {string} [cardManaCost]
 * @prop {string} [cardArtUrl]
 * @prop {string[]} [cardColors]
 * @prop {string} [cardTypeLine]
 * @prop {string} [cardOracleText]
 * @prop {string} [cardPower]
 * @prop {string} [cardToughness]
 * @prop {string} [cardLoyalty]
 * @prop {string} [cardSet]
 * @prop {boolean} [devoid]
 * @prop {boolean} [blackBordered]
 * @prop {'left'|'right'|null} [subCardPosition]
 * @prop {object} [subCard]
 */

/**
 * @typedef {function(canvas: HTMLCanvasElement, card: CardProps): void} CardRenderer
 *   Draws a whole card on a CARD_WIDTH x CARD_HEIGHT canvas
 */

/** @type {Object<string, CardRenderer>} */
const CARD_RENDERERS = {
  realistic: renderRealisticCard,
  minimalist: renderMinimalistCard,
};

export const DEFAULT_CARD_STYLE = 'realistic';

/**
 * Render function of a card style. Unknown styles get the default one.
 *
 * @param {string} cardStyle - e.g. `realistic` or `minimalist`
 * @returns {CardRenderer}
 */
export const getCardRenderer = (cardStyle) => CARD_RENDERERS[cardStyle] ?? CARD_RENDERERS[DEFAULT_CARD_STYLE];
