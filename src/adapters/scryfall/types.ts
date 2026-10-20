// Scryfall's data, with the fields the press uses. See https://scryfall.com/docs/api/cards

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
  defense?: string;
  image_uris?: ScryfallImageUris;
}

export interface ScryfallCard {
  name: string;
  layout: string;
  mana_cost?: string;
  colors?: string[];
  oracle_text?: string;
  type_line?: string;
  set: string;
  multiverse_ids?: number[];
  keywords?: string[];
  image_uris?: ScryfallImageUris;
  card_faces?: ScryfallCardFace[];
  power?: string;
  toughness?: string;
  loyalty?: string;
  defense?: string;
}

export interface ScryfallSymbology {
  data: { symbol: string; svg_uri: string }[];
}
