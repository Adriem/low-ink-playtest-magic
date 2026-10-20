import { computeCardColors, type ArtCrop, type Card, type CardFace } from '../../domain/cards';
import { isColorSymbol } from '../../domain/colors';
import type { CardAbility, OracleLine, OracleText } from '../../domain/oracleText';
import type { ScryfallCard, ScryfallCardFace } from './types';

const SUBCARD_LAYOUTS: Record<string, Card['layout']> = {
  adventure: 'subcard-left',
  prepare: 'subcard-right',
};

/**
 * The card of the press for a card from Scryfall.
 */
const MODE_PREFIX = '• ';
const SAGA_CHAPTER_REGEX = /^([IVX]+(?:\s*,\s*[IVX]+)*)\s*[—–]\s*(.+)$/;
const LOYALTY_ABILITY_REGEX = /^([+−-]?(?:\d+|X)):\s*(.+)$/;
// Ability words and names of abilities: a short phrase without punctuation before " — "
const NAME_REGEX = /^([A-Z][^—•(){}.,:;+]{0,40}?) — (.+)$/;

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
    oracleText: toOracleText(face.oracle_text),
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
  if (face.defense) return 'battle';
  return 'regular';
};

const getStats = ({ power, toughness, loyalty, defense }: ScryfallCardFace): CardFace['stats'] => {
  if (power != null && toughness != null) return { power, toughness };
  if (loyalty != null) return { loyalty };
  if (defense != null) return { defense };
  return undefined;
};

/**
 * Parse the rules text of a card face, as Scryfall writes it, by line: "•"
 * lines are modes of the line above.
 */
const toOracleText = (oracleText = ''): OracleText => {
  const lines: OracleLine[] = [];

  for (const rawLine of oracleText.split('\n')) {
    const line = rawLine.trim();
    if (!line) continue;

    const previous = lines.at(-1);
    if (line.startsWith(MODE_PREFIX) && previous) {
      previous.modes = [...(previous.modes ?? []), parseOracleTextLine(line.slice(MODE_PREFIX.length))];
      continue;
    }

    lines.push(toOracleLine(line));
  }

  return { lines };
};

/**
 * A line of oracle text: a saga chapter, a loyalty ability, or any other
 * ability.
 */
const toOracleLine = (line: string): OracleLine => {
  const chapter = line.match(SAGA_CHAPTER_REGEX);
  if (chapter) {
    const chapterNumbers = chapter[1].split(',').map((number) => number.trim());
    return { chapterNumbers, ...parseOracleTextLine(chapter[2]) };
  }

  const loyaltyAbility = line.match(LOYALTY_ABILITY_REGEX);
  if (loyaltyAbility) return { loyaltyCost: loyaltyAbility[1], ...parseOracleTextLine(loyaltyAbility[2]) };

  return parseOracleTextLine(line);
};

/**
 * The ability in a line, with its name and reminder text apart from its rules
 * text. Only a parenthetical at the end of the line is reminder text: ones in
 * the middle of it are part of the rules (e.g. "costs {U} (or {1}) less").
 */
const parseOracleTextLine = (line: string): CardAbility => {
  const named = line.match(NAME_REGEX);
  const name = named?.[1];
  const body = named ? named[2] : line;

  const reminderStart = findTrailingParenthetical(body);
  const text = reminderStart === -1 ? body : body.slice(0, reminderStart).trimEnd();
  const reminderText = reminderStart === -1 ? undefined : body.slice(reminderStart);

  return {
    ...(name ? { name } : {}),
    text,
    ...(reminderText ? { reminderText } : {}),
  };
};

/**
 * Where the parenthetical that ends a text starts, or -1 if it doesn't end
 * with one.
 */
const findTrailingParenthetical = (text: string) => {
  if (!text.endsWith(')')) return -1;

  let depth = 0;
  for (let i = text.length - 1; i >= 0; i--) {
    if (text[i] === ')') depth++;
    if (text[i] === '(') depth--;
    if (depth === 0) return i;
  }
  return -1;
};
