/** Part of a card's art image that belongs to one of its faces, for split cards with both arts side by side */
export type CropArt = 'left-half' | 'right-half';

export interface ScryfallImageUris {
  art_crop?: string;
  normal?: string;
}

/** A face of a card with several (split, flip, double-faced, adventure…) */
export interface ScryfallCardFace {
  name: string;
  mana_cost?: string;
  type_line?: string;
  oracle_text?: string;
  colors?: string[];
  power?: string;
  toughness?: string;
  loyalty?: string;
  image_uris?: ScryfallImageUris;
  /** Set on the faces of unified split cards, whose art is shared */
  _cropArt?: CropArt;
}

/** A card as Scryfall returns it, with the fields the press uses */
export interface ScryfallCard {
  name: string;
  layout: string;
  mana_cost?: string;
  colors?: string[];
  oracle_text?: string;
  type_line?: string;
  set: string;
  multiverse_ids: number[];
  keywords?: string[];
  image_uris?: ScryfallImageUris;
  card_faces?: ScryfallCardFace[];
  power?: string;
  toughness?: string;
  loyalty?: string;
}

/** Placeholder for a card that's still being fetched */
export interface LoadingCard {
  _loading: true;
  /** Identifies the placeholder until its card loads */
  _loadingCardId: number;
}

export type CollectionCard = ScryfallCard | LoadingCard;

export const isLoadingCard = (card: CollectionCard): card is LoadingCard => '_loading' in card;

/** Where a card (or one of its faces) is placed in the sheets */
interface SheetPlacement {
  /** Index of the collection card it comes from */
  _collectionIndex: number;
  /** Index of the face, when the card is split into faces */
  _faceIndex?: number;
  /** Part of the card's art image that belongs to the face */
  _cropArt?: CropArt;
  /** The second face of cards drawn with a sub-card (adventures…) */
  _subFace?: ScryfallCardFace;
}

/** A collection card, or one of its faces, placed in a sheet */
export type SheetCard = (ScryfallCard & SheetPlacement) | (LoadingCard & SheetPlacement);
