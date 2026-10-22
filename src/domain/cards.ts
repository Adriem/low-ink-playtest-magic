import { ColorSymbol, isColorSymbol } from './colors';
import type { OracleText } from './oracleText';
import { getSymbolValue, splitSymbols } from './symbols';

/**
 * Part of the art image a face shows, from and to fractions of its width:
 * split cards have the arts of both faces side by side in a single image.
 */
export type ArtCrop = { from: number; to: number };

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
};

export type Card = {
  name: string;
  layout: 'normal' | 'split' | 'double-faced' | 'subcard-left' | 'subcard-right';
  set: string;
  multiverseIds: string[];
  mainFace: CardFace;
  secondaryFace?: CardFace;
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
 * "David Martin & Franz Vohwinkel"), so each is credited once.
 */
export const getArtists = (cardFaces: CardFace[]): string | undefined => {
  const artists = [...new Set(cardFaces.map((cardFace) => cardFace.artist).filter(Boolean))];
  return artists.length > 0 ? artists.join(' & ') : undefined;
};
