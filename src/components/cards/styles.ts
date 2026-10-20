import type { CardFace, SubCardPosition } from '../../domain/cards';
import type { Palette } from '../../domain/colorTreatment';
import { renderMinimalistCard } from './minimalist/render';
import { DEFAULT_PALETTES } from './palettes';
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
  /** Colors of the card style's palette that replace its defaults, e.g. ones saved by the user */
  customPalette?: CustomPalette;
}

/** Colors of a palette by name (e.g. `RED`), as hex values */
export type CustomPalette = Partial<Record<string, string>>;

/**
 * How much ink to spend on a card: `low` leaves its boxes blank, `medium`
 * fills the title and type boxes with a dot pattern in the colors of the card,
 * `high` fills them with the colors of the card (and the text boxes lightly),
 * and `splurge` also gives the card a black border.
 */
export type InkLevel = 'low' | 'medium' | 'high' | 'splurge';

/**
 * How the art of a card is drawn: `blank` leaves the art box blank,
 * `contours` traces only its contours, `mid-tones` shades only its midtones,
 * `posterized` reduces it to a few light grays, `grayscale` turns it to light
 * grayscale, and `no-filter` draws it as it is.
 */
export type ArtFidelity = 'blank' | 'contours' | 'mid-tones' | 'posterized' | 'grayscale' | 'no-filter';

/** Draws a whole card on a CARD_WIDTH x CARD_HEIGHT canvas */
export type CardRenderer = (canvas: HTMLCanvasElement, card: CardRenderProps) => void;

export type CardStyle = 'realistic' | 'minimalist';

interface CardStyleDefinition {
  render: CardRenderer;
  palette: Palette;
}

const CARD_STYLES: Record<CardStyle, CardStyleDefinition> = {
  realistic: { render: renderRealisticCard, palette: DEFAULT_PALETTES.realistic },
  minimalist: { render: renderMinimalistCard, palette: DEFAULT_PALETTES.minimalist },
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
