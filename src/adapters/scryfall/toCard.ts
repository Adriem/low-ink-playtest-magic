import { computeCardColors, type ArtCrop, type Card, type CardFace } from '../../domain/cards';
import { isColorSymbol } from '../../domain/colors';
import type { ScryfallCard, ScryfallCardFace } from './types';

const SUBCARD_LAYOUTS: Record<string, Card['layout']> = {
  adventure: 'subcard-left',
  prepare: 'subcard-right',
};

/**
 * The card of the press for a card from Scryfall.
 */
export const toCard = (card: ScryfallCard): Card => {
  const [mainFace, secondaryFace] = card.card_faces ?? [card];

  return {
    name: card.name,
    layout: getCardLayout(card),
    set: card.set,
    multiverseIds: (card.multiverse_ids ?? []).map(String),
    mainFace: toCardFace(card, mainFace, 0),
    ...(secondaryFace ? { secondaryFace: toCardFace(card, secondaryFace, 1) } : {}),
  };
};

const getCardLayout = (card: ScryfallCard): Card['layout'] => {
  if (!card.card_faces) return 'normal';
  if (card.layout === 'split') return 'split';
  return SUBCARD_LAYOUTS[card.layout] ?? 'double-faced';
};

/**
 * A face of a card, or the card itself when it has a single face. Faces get
 * their own colors when Scryfall has them, else the ones of their mana cost
 * (e.g. each half of a split card), else the ones of the card (e.g. the
 * flipped side of flip cards). Faces without their own art use the card's.
 */
const toCardFace = (card: ScryfallCard, face: ScryfallCardFace, faceIndex: number): CardFace => {
  const colors =
    face.colors ?? (face.mana_cost ? computeCardColors({ manaCost: face.mana_cost }) : (card.colors ?? []));

  return {
    name: face.name,
    manaCost: face.mana_cost,
    faceLayout: getFaceLayout(face),
    typeLine: face.type_line ?? '',
    oracleText: face.oracle_text,
    colors: toColors(colors),
    stats: getStats(face),
    art: {
      assetUrl: face.image_uris?.art_crop ?? card.image_uris?.art_crop,
      crop: getArtCrop(card, faceIndex),
    },
  };
};

// Split cards have the art of both faces side by side in a single image,
// first face on the left. Aftermath cards are excluded: their arts don't take
// half of the image each.
const getArtCrop = (card: ScryfallCard, faceIndex: number): ArtCrop => {
  const hasSideBySideArt = card.layout === 'split' && !card.keywords?.includes('Aftermath');
  if (!hasSideBySideArt) return 'full';
  return faceIndex === 0 ? 'left-half' : 'right-half';
};

const toColors = (colors: string[]) => {
  return colors.filter(isColorSymbol);
};

const getFaceLayout = (face: ScryfallCardFace): CardFace['faceLayout'] => {
  if (/\bSaga\b/i.test(face.type_line ?? '')) return 'saga';
  if (face.loyalty) return 'planeswalker';
  return 'regular';
};

const getStats = ({ power, toughness, loyalty }: ScryfallCardFace): CardFace['stats'] => {
  if (power != null && toughness != null) return { power, toughness };
  if (loyalty != null) return { loyalty };
  return undefined;
};
