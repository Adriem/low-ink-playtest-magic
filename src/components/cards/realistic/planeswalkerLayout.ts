import {
  ARTWORK_HEIGHT,
  ARTWORK_Y,
  CONTENT_WIDTH,
  ORACLE_HEIGHT,
  ORACLE_Y,
  PINLINE_THICKNESS,
  TITLE_HEIGHT,
  TITLE_Y,
  TYPELINE_Y,
} from './config';

/** Space between the art box's edges and its art, on each side */
export const ART_INSET = PINLINE_THICKNESS + 2;

/**
 * Rounded corners of planeswalkers' art box, which make it egg shaped: of the
 * box's pinline (its outer edge), and of the art inside it. The pinline is at
 * least as wide as the other boxes' all around, and wider where its corners
 * curve less than the art's.
 */
export const ART_CORNER_RADII = {
  pinline: {
    top: { horizontal: 10, vertical: 150 },
    bottom: { horizontal: 7, vertical: 140 },
  },
  art: {
    top: { horizontal: 22, vertical: 200 },
    bottom: { horizontal: 21, vertical: 136 },
  },
};

/** How much wider planeswalkers' art box is than the other boxes */
const ART_EXTRA_WIDTH = 8;

/** How much higher the boxes above the oracle box go on planeswalkers, to give it more room */
const RAISE = Math.round(TITLE_HEIGHT * 0.25);

/** Lowest the oracle box of a planeswalker gets, so tall art doesn't leave its abilities without room */
const MIN_ORACLE_HEIGHT = 160;

/** Where the boxes of a planeswalker go */
export interface PlaneswalkerLayout {
  titleY: number;
  artY: number;
  artWidth: number;
  artHeight: number;
  typelineY: number;
  oracleY: number;
  oracleHeight: number;
}

/**
 * Where the boxes of a planeswalker go: the boxes above the oracle box go a bit
 * higher than on other cards, its art box is a bit wider and keeps the aspect
 * ratio of its art,
 * which varies with the planeswalker's frame, and its oracle box takes the rest
 * of the card. Without art, the art box is as tall as on other cards.
 *
 * @param art - The art, once loaded, with its size
 */
export const getPlaneswalkerLayout = (
  art?: { naturalWidth: number; naturalHeight: number } | null,
): PlaneswalkerLayout => {
  // The art fills the art box's inner box, inside its pinline
  const artWidth = CONTENT_WIDTH + ART_EXTRA_WIDTH;
  const artImageWidth = artWidth - PINLINE_THICKNESS * 2;
  const artHeight =
    art && art.naturalWidth > 0
      ? Math.round((artImageWidth * art.naturalHeight) / art.naturalWidth) + PINLINE_THICKNESS * 2
      : ARTWORK_HEIGHT;
  const shift = Math.min(artHeight - ARTWORK_HEIGHT, ORACLE_HEIGHT - MIN_ORACLE_HEIGHT);

  return {
    titleY: TITLE_Y - RAISE,
    artY: ARTWORK_Y - RAISE,
    artWidth,
    artHeight: ARTWORK_HEIGHT + shift,
    typelineY: TYPELINE_Y + shift - RAISE,
    oracleY: ORACLE_Y + shift - RAISE,
    oracleHeight: ORACLE_HEIGHT - shift + RAISE,
  };
};
