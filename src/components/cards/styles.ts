import type { CardFace, SubCardPosition } from '../../domain/cards';
import type { Palette } from '../../domain/colorTreatment';
import { MINIMALIST_PALETTE } from './minimalist/palette';
import { renderMinimalistCard } from './minimalist/render';
import { REALISTIC_PALETTE } from './realistic/palette';
import { renderRealisticCard } from './realistic/render';

/** Part of the card's width the oracle box takes, next to a sub-card */
export type OracleLayout = 'full-width' | 'left-half' | 'right-half';

export const CARD_WIDTH = 500;
export const CARD_HEIGHT = 700;

/** What a card style draws: a face, with the secondary face as a sub-card for cards like adventures */
export interface CardRenderProps {
  face: CardFace;
  subFace?: CardFace;
  subFacePosition?: SubCardPosition;
  blackBordered?: boolean;
  inkLevel?: InkLevel;
  artFidelity?: ArtFidelity;
}

/**
 * How much ink to spend on a card: `low` leaves its boxes blank, `medium`
 * fills the title and type boxes with a dot pattern in the colors of the card,
 * `high` fills them with the colors of the card (and the text boxes lightly),
 * and `splurge` also gives the card a black border.
 */
export type InkLevel = 'low' | 'medium' | 'high' | 'splurge';

/**
 * How the art of a card is drawn: `none` leaves the art box blank, `contours`
 * draws only its contours, `minimal` draws it with a few light shades of
 * gray, `shaded` with more of them, `black-and-white` in light gray tones, and
 * `full` as it is.
 */
export type ArtFidelity = 'none' | 'contours' | 'minimal' | 'shaded' | 'black-and-white' | 'full';

/** Draws a whole card on a CARD_WIDTH x CARD_HEIGHT canvas */
export type CardRenderer = (canvas: HTMLCanvasElement, card: CardRenderProps) => void;

export type CardStyle = 'realistic' | 'minimalist';

interface CardStyleDefinition {
  render: CardRenderer;
  palette: Palette;
}

const CARD_STYLES: Record<CardStyle, CardStyleDefinition> = {
  realistic: { render: renderRealisticCard, palette: REALISTIC_PALETTE },
  minimalist: { render: renderMinimalistCard, palette: MINIMALIST_PALETTE },
};

export const DEFAULT_CARD_STYLE: CardStyle = 'realistic';

/**
 * Renderer and palette of a card style. Unknown styles get the default one.
 *
 * @param cardStyle - e.g. `realistic` or `minimalist`
 */
export const getCardStyle = (cardStyle: string): CardStyleDefinition => {
  return CARD_STYLES[cardStyle as CardStyle] ?? CARD_STYLES[DEFAULT_CARD_STYLE];
};
