import { chunk } from '../utils/array';
import { Card, CardFace, getSubCardPosition, SubCardPosition } from './cards';

/** Placeholder for a card that's still being fetched */
export type LoadingCard = {
  loading: true;
  /** Identifies the placeholder until its card loads */
  loadingCardId: number;
};

/** A card in the press, or the placeholder of one being fetched */
export type CollectionCard = Card | LoadingCard;

export const isLoadingCard = (card: CollectionCard): card is LoadingCard => 'loading' in card;

/** Whether split or double-faced cards are kept as a single card or split into one card per face */
export type CardTreatment = 'unified' | 'separate';

/** Which face of its card a sheet item shows: all of it, its main face or its secondary face */
export type SheetFace = 'single' | 'main' | 'secondary';

type SheetItemBase = {
  /** Index of the collection card it comes from */
  collectionIndex: number;
};

/** What a slot of a press sheet shows */
export type SheetItem = SheetItemBase &
  (
    | { kind: 'loading'; loadingCardId: number }
    /** A face of a card, with the secondary face as a sub-card for cards like adventures */
    | {
        kind: 'face';
        card: Card;
        face: CardFace;
        sheetFace: SheetFace;
        subFace?: CardFace;
        subFacePosition?: SubCardPosition;
      }
    /** Both faces of a card side by side */
    | { kind: 'faces'; card: Card; faces: [CardFace, CardFace] }
  );

/** Cards in each sheet, the same as in each page of the exported PDF (3x3) */
export const CARDS_PER_SHEET = 9;

export type SheetConfig = {
  /** Amount of cards in each sheet */
  sheetSize?: number;
  splitCardTreatment?: CardTreatment;
  doubleFacedCardTreatment?: CardTreatment;
};

const getTreatment = (card: Card, config: Required<SheetConfig>): CardTreatment => {
  if (card.layout === 'split') return config.splitCardTreatment;
  if (card.layout === 'double-faced') return config.doubleFacedCardTreatment;
  return 'separate';
};

const toSheetItems = (card: CollectionCard, collectionIndex: number, config: Required<SheetConfig>): SheetItem[] => {
  if (isLoadingCard(card)) return [{ kind: 'loading', collectionIndex, loadingCardId: card.loadingCardId }];

  const { mainFace, secondaryFace } = card;
  if (!secondaryFace) return [{ kind: 'face', collectionIndex, card, face: mainFace, sheetFace: 'single' }];

  const subFacePosition = getSubCardPosition(card);
  if (subFacePosition) {
    return [
      {
        kind: 'face',
        collectionIndex,
        card,
        face: mainFace,
        sheetFace: 'single',
        subFace: secondaryFace,
        subFacePosition,
      },
    ];
  }

  if (getTreatment(card, config) === 'unified') {
    return [{ kind: 'faces', collectionIndex, card, faces: [mainFace, secondaryFace] }];
  }

  return [
    { kind: 'face', collectionIndex, card, face: mainFace, sheetFace: 'main' },
    { kind: 'face', collectionIndex, card, face: secondaryFace, sheetFace: 'secondary' },
  ];
};

/**
 * Group the cards of a collection into sheets. Depending on the settings,
 * split and double-faced cards are kept as a single card or split into one
 * card per face.
 */
export const groupCardsIntoSheets = (
  cards: CollectionCard[],
  {
    sheetSize = CARDS_PER_SHEET,
    splitCardTreatment = 'separate',
    doubleFacedCardTreatment = 'separate',
  }: SheetConfig = {},
): SheetItem[][] => {
  const config = { sheetSize, splitCardTreatment, doubleFacedCardTreatment };
  const items = cards.flatMap((card, collectionIndex) => toSheetItems(card, collectionIndex, config));
  return chunk(items, sheetSize);
};

/**
 * Move the card at `fromIndex` so it ends up at `toIndex`. Moves outside the
 * collection leave it as it is.
 */
export const moveCard = <T>(collection: T[], fromIndex: number, toIndex: number): T[] => {
  const isInCollection = (index: number) => index >= 0 && index < collection.length;
  if (fromIndex === toIndex || !isInCollection(fromIndex) || !isInCollection(toIndex)) return collection;

  const reordered = [...collection];
  const [card] = reordered.splice(fromIndex, 1);
  reordered.splice(toIndex, 0, card);
  return reordered;
};
