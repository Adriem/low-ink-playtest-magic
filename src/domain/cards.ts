import { ColorSymbol, isColorSymbol } from './colors';
import type { OracleText } from './oracleText';
import { getSymbolValue, splitSymbols } from './symbols';

/**
 * Part of the art image a face shows, from and to fractions of its width:
 * split cards have the arts of both faces side by side in a single image.
 */
export type ArtCrop = {
  from: number;
  to: number;
  /** Whether that part is cropped further to fill its box, keeping its proportions (e.g. art from anywhere) */
  cover?: boolean;
};

/**
 * How the art of a card is drawn: `blank` leaves the art box blank,
 * `contours` traces only its contours, `mid-tones` shades only its midtones,
 * `posterized` reduces it to a few light grays, `grayscale` turns it to light
 * grayscale, and `no-filter` draws it as it is.
 */
export type ArtFidelity = 'blank' | 'contours' | 'mid-tones' | 'posterized' | 'grayscale' | 'no-filter';

/** The whole art image */
export const FULL_ART_CROP: ArtCrop = { from: 0, to: 1 };

/** Which way a face is printed: battles and the first half of aftermath cards are printed sideways */
export type Orientation = 'portrait' | 'landscape';

export type CardFace = {
  name: string;
  manaCost?: string;
  faceLayout: 'regular' | 'planeswalker' | 'saga' | 'battle';
  orientation: Orientation;
  typeLine: string;
  oracleText: OracleText;
  colors: ColorSymbol[];
  stats?: { power: string; toughness: string } | { loyalty: string } | { defense: string };
  art: { assetUrl?: string; crop: ArtCrop };
  /** Who illustrated the face's art, to credit them on the card */
  artist?: string;
  /** Art of the user's own, drawn instead of the face's */
  artOverride?: ArtOverride;
};

/**
 * Art that replaces a face's: an image from anywhere, the part of it to draw,
 * how faithfully it's drawn, and who made it
 */
export type ArtOverride = { url: string; crop: ArtCrop; fidelity: ArtFidelity; artist: string };

/** Artist of art overrides whose artist isn't given */
export const UNKNOWN_ARTIST = 'unknown';

export type Card = {
  name: string;
  layout: 'normal' | 'split' | 'double-faced' | 'subcard-left' | 'subcard-right';
  set: string;
  multiverseIds: string[];
  mainFace: CardFace;
  secondaryFace?: CardFace;
};

/**
 * Images to override the art of a card with: one for all its faces, with
 * their arts side by side like the card's own image, or one per face (its
 * main face's, then its secondary face's).
 */
export type ArtOverrideImages = { kind: 'unified'; url: string } | { kind: 'split'; urls: (string | undefined)[] };

/**
 * The art a face is drawn with: its override's, if it has one, else its own.
 */
export const getDrawnArt = (face: CardFace): CardFace['art'] => {
  return face.artOverride ? { assetUrl: face.artOverride.url, crop: face.artOverride.crop } : face.art;
};

/**
 * A card with the art of its faces overridden by images of the user's own,
 * drawn with a fidelity. One image for all the faces is cropped like the
 * card's own image (e.g. each half of a split card), and an image per face is
 * drawn whole. Either way, the images keep their proportions, cropped to fill
 * their art box. Faces without an image of their own keep their art.
 *
 * @param artist - Who made the images, credited instead of the faces' artists
 *   (`unknown` if not given)
 */
export const overrideArt = (card: Card, images: ArtOverrideImages, fidelity: ArtFidelity, artist = ''): Card => {
  return mapFaces(card, (face, faceIndex) => {
    const url = images.kind === 'unified' ? images.url : images.urls[faceIndex];
    if (!url) return { ...face, artOverride: undefined };

    const crop = images.kind === 'unified' ? face.art.crop : FULL_ART_CROP;
    return {
      ...face,
      artOverride: { url, crop: { ...crop, cover: true }, fidelity, artist: artist.trim() || UNKNOWN_ARTIST },
    };
  });
};

/**
 * A card with the art of its faces, without their overrides.
 */
export const clearArtOverrides = (card: Card): Card => {
  return mapFaces(card, (face) => ({ ...face, artOverride: undefined }));
};

const mapFaces = (card: Card, mapFace: (face: CardFace, faceIndex: number) => CardFace): Card => {
  return {
    ...card,
    mainFace: mapFace(card.mainFace, 0),
    ...(card.secondaryFace ? { secondaryFace: mapFace(card.secondaryFace, 1) } : {}),
  };
};

/** Side of the card the secondary face is drawn on, for cards with a sub-card (e.g. adventures) */
export type SubCardPosition = 'left' | 'right';

export const getSubCardPosition = (card: Card): SubCardPosition | undefined => {
  if (card.layout === 'subcard-left') return 'left';
  if (card.layout === 'subcard-right') return 'right';
  return undefined;
};

/** Colors of the mana symbols in a mana cost, including hybrid ones */
export const computeCardColors = (cardFace: Pick<CardFace, 'manaCost'>): ColorSymbol[] => {
  const found = new Set<ColorSymbol>();

  for (const manaSymbol of splitSymbols(cardFace.manaCost || '')) {
    for (const part of getSymbolValue(manaSymbol).split('/')) {
      if (isColorSymbol(part)) found.add(part);
    }
  }

  return [...found];
};

export const isArtifactType = (cardFace: CardFace) => {
  return /artifact/i.test(cardFace.typeLine);
};

export const isLandType = (cardFace: CardFace) => {
  return /land/i.test(cardFace.typeLine);
};

export const getPowerAndToughness = (cardFace: CardFace) => {
  return cardFace.stats && 'power' in cardFace.stats ? cardFace.stats : undefined;
};

export const getLoyalty = (cardFace: CardFace) => {
  return cardFace.stats && 'loyalty' in cardFace.stats ? cardFace.stats.loyalty : undefined;
};

export const getDefense = (cardFace: CardFace) => {
  return cardFace.stats && 'defense' in cardFace.stats ? cardFace.stats.defense : undefined;
};

/**
 * The artists of faces, joined with " & " when they're not the same (e.g.
 * "David Martin & Franz Vohwinkel"), so each is credited once. Faces drawn
 * with an art override credit its artist instead of their own.
 */
export const getArtists = (cardFaces: CardFace[]): string | undefined => {
  const artists = [
    ...new Set(cardFaces.map((cardFace) => cardFace.artOverride?.artist ?? cardFace.artist).filter(Boolean)),
  ];
  return artists.length > 0 ? artists.join(' & ') : undefined;
};
