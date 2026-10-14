import { renderMinimalistCard } from './minimalist/render';
import { renderRealisticCard } from './realistic/render';
import type { CropArt, ScryfallCardFace } from '../types/cards';

/** Position of the sub-card (e.g. an adventure) in the card */
export type SubCardPosition = 'left' | 'right';

/** Part of the card's width the oracle box takes, next to a sub-card */
export type OracleLayout = 'full-width' | 'left-half' | 'right-half';

export const CARD_WIDTH = 500;
export const CARD_HEIGHT = 700;

/** What a card style draws */
export interface CardProps {
  cardName: string;
  cardManaCost?: string;
  cardArtUrl?: string;
  /** Part of the art image to draw, for split cards whose faces share an image with both arts side by side */
  cropArt?: CropArt;
  cardColors?: string[] | null;
  cardTypeLine?: string;
  cardOracleText?: string;
  cardPower?: string;
  cardToughness?: string;
  cardLoyalty?: string;
  cardSet?: string;
  devoid?: boolean;
  blackBordered?: boolean;
  subCardPosition?: SubCardPosition | null;
  subCard?: ScryfallCardFace;
}

/** Draws a whole card on a CARD_WIDTH x CARD_HEIGHT canvas */
export type CardRenderer = (canvas: HTMLCanvasElement, card: CardProps) => void;

export type CardStyle = 'realistic' | 'minimalist';

const CARD_RENDERERS: Record<CardStyle, CardRenderer> = {
  realistic: renderRealisticCard,
  minimalist: renderMinimalistCard,
};

export const DEFAULT_CARD_STYLE: CardStyle = 'realistic';

/**
 * Render function of a card style. Unknown styles get the default one.
 *
 * @param cardStyle - e.g. `realistic` or `minimalist`
 */
export const getCardRenderer = (cardStyle: string): CardRenderer => (
  CARD_RENDERERS[cardStyle as CardStyle] ?? CARD_RENDERERS[DEFAULT_CARD_STYLE]
);
