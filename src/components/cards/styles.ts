import type { CardFace, SubCardPosition } from '../../domain/cards';
import type { Palette } from '../../domain/colorTreatment';
import { renderMinimalistCardContents } from './minimalist/renderContent';
import { renderMinimalistFooter } from './minimalist/renderFooter';
import { DEFAULT_PALETTES } from './palettes';
import { renderRealisticCardContents } from './realistic/renderContent';
import { renderRealisticFooter } from './realistic/renderFooter';

/** Part of the card's width the oracle box takes, next to a sub-card */
export type OracleLayout = 'full-width' | 'left-half' | 'right-half';

export { CARD_HEIGHT, CARD_WIDTH } from './common/cardSize';

/**
 * What a card style draws as a card's contents: a face, with the secondary
 * face as a sub-card for cards like adventures. The card adds its footer and
 * frame on top.
 */
export interface CardRenderProps {
  face: CardFace;
  subFace?: CardFace;
  subFacePosition?: SubCardPosition;
  /** With a black border around the card's content, as wide as the canvas around it */
  blackBordered?: boolean;
  inkLevel?: InkLevel;
  artFidelity?: ArtFidelity;
  /** Colors of the card style's palette that replace its defaults, e.g. ones saved by the user */
  customPalette?: CustomPalette;
  /** Drawn as a half of a unified card, which is already turned sideways to read it */
  unified?: boolean;
}

/**
 * Where a card's footer goes, on the card's canvas:
 * - `card-bottom`: at the bottom of a card on its own
 * - `right-side`: along the right side of a unified card, which is its bottom
 *   when it's turned to read its halves side by side
 * - `upright-half`: below the half of a unified card that reads upright (e.g.
 *   a battle), which is its top half
 */
export type FooterPlacement = 'card-bottom' | 'right-side' | 'upright-half';

/** What a card style draws as a card's footer: the faces whose artists it credits, and where */
export interface CardFooterProps {
  faces: CardFace[];
  placement: FooterPlacement;
  blackBordered?: boolean;
  artFidelity?: ArtFidelity;
  customPalette?: CustomPalette;
}

/** Colors of a palette by name (e.g. `RED`), as hex values */
export type CustomPalette = Partial<Record<string, string>>;

/**
 * How much ink to spend on a card: `low` leaves its boxes blank, `medium`
 * fills the title and type boxes with a dot pattern in the colors of the card,
 * and `high` fills them with the colors of the card (and the text boxes
 * lightly).
 */
export type InkLevel = 'low' | 'medium' | 'high';

/**
 * How the art of a card is drawn: `blank` leaves the art box blank,
 * `contours` traces only its contours, `mid-tones` shades only its midtones,
 * `posterized` reduces it to a few light grays, `grayscale` turns it to light
 * grayscale, and `no-filter` draws it as it is.
 */
export type ArtFidelity = 'blank' | 'contours' | 'mid-tones' | 'posterized' | 'grayscale' | 'no-filter';

/** Draws the contents of a card on a CARD_WIDTH x CARD_HEIGHT canvas */
export type CardContentsRenderer = (canvas: HTMLCanvasElement, card: CardRenderProps) => void;

/** Draws the footer of a card */
export type CardFooterRenderer = (ctx: CanvasRenderingContext2D, footer: CardFooterProps) => void;

export type CardStyle = 'realistic' | 'minimalist';

interface CardStyleDefinition {
  renderCardContents: CardContentsRenderer;
  renderFooter: CardFooterRenderer;
  palette: Palette;
  /** Whether a face is drawn sideways, turned counterclockwise into the card (e.g. realistic landscape faces) */
  isDrawnSideways: (face: CardFace) => boolean;
  /** Whether unified cards draw a line between their halves, for faces that have no frame to tell them apart */
  separatesHalves: boolean;
}

const CARD_STYLES: Record<CardStyle, CardStyleDefinition> = {
  realistic: {
    renderCardContents: renderRealisticCardContents,
    renderFooter: renderRealisticFooter,
    palette: DEFAULT_PALETTES.realistic,
    isDrawnSideways: (face) => face.orientation === 'landscape',
    separatesHalves: false,
  },
  // Minimalist landscape faces keep their title and type line upright, so the card reads in hand
  minimalist: {
    renderCardContents: renderMinimalistCardContents,
    renderFooter: renderMinimalistFooter,
    palette: DEFAULT_PALETTES.minimalist,
    isDrawnSideways: () => false,
    separatesHalves: true,
  },
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
