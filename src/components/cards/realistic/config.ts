import type { Orientation } from '../../../domain/cards';
export const FONT_FAMILY = 'Serif';

export const TITLE_Y = 32;
export const TITLE_HEIGHT = 48;
export const TITLE_FONT_SIZE = 28;

export const ARTWORK_Y = 76;
export const ARTWORK_HEIGHT = 319;

export const TYPELINE_Y = 392;
export const TYPELINE_HEIGHT = 48;
export const TYPELINE_FONT_SIZE = 23;

export const ORACLE_Y = 436;
export const ORACLE_HEIGHT = 215;
export const ORACLE_FONT_SIZE = 25;

export const STATSLINE_Y = 624;
export const STATSLINE_WIDTH = 88;
export const STATSLINE_HEIGHT = 41;
export const STATSLINE_FONT_SIZE = 28;

// Sagas have the type line at the bottom of the card, and two columns between
// it and the title: the oracle box on the left half and the art on the right.
// The columns overlap the type line as much as the art box does on other cards.
// The type line sits a bit above where the oracle box ends on other cards, to
// match printed sagas
export const SAGA_TYPELINE_RAISE = 15;
export const SAGA_TYPELINE_Y = ORACLE_Y + ORACLE_HEIGHT - TYPELINE_HEIGHT - SAGA_TYPELINE_RAISE;
export const SAGA_COLUMNS_Y = ARTWORK_Y;
export const SAGA_COLUMNS_TYPELINE_OVERLAP = ARTWORK_Y + ARTWORK_HEIGHT - TYPELINE_Y;

// Saga creatures have an extra oracle box below the type line for their
// creature abilities, which raises the type line and shortens the columns.
// It overlaps the type line like the oracle box does on other cards.
export const SAGA_CREATURE_ORACLE_HEIGHT = TYPELINE_HEIGHT * 1.5;
export const SAGA_CREATURE_TYPELINE_Y = SAGA_TYPELINE_Y - TYPELINE_HEIGHT * 1.25;
export const SAGA_CREATURE_ORACLE_Y =
  SAGA_CREATURE_TYPELINE_Y + TYPELINE_HEIGHT - (TYPELINE_Y + TYPELINE_HEIGHT - ORACLE_Y);

export const TITLE_WIDTH = 450;
export const CONTENT_WIDTH = 434;

export const PINLINE_THICKNESS = 4;
export const CAPSULE_INNER_STROKE = 2;

export const MANA_SYMBOL_DIAMETER = 24;
export const MANA_SYMBOL_SPACING = 2.5;
export const MANA_SYMBOL_EDGE_PADDING = 10;

export const SUBCARD_TITLE_Y = ORACLE_Y;
export const SUBCARD_TITLE_HEIGHT = 38;
export const SUBCARD_TITLE_FONT_SIZE = 20;

export const SUBCARD_TYPELINE_Y = ORACLE_Y + 35;
export const SUBCARD_TYPELINE_HEIGHT = 38;
export const SUBCARD_TYPELINE_FONT_SIZE = 18;

export const SUBCARD_ORACLE_Y = ORACLE_Y + 71;
export const SUBCARD_ORACLE_HEIGHT = ORACLE_HEIGHT - (SUBCARD_ORACLE_Y - ORACLE_Y);
export const SUBCARD_ORACLE_FONT_SIZE = 20;

export const SUBCARD_MANA_SYMBOL_DIAMETER = 21;
export const SUBCARD_MANA_SYMBOL_SPACING = 2.5;
export const SUBCARD_MANA_SYMBOL_EDGE_PADDING = 10;

// Text inside the title, type and subcard capsules starts this far from the inner border
export const CAPSULE_TEXT_INSET = 7;
// Baseline of the title and type line text, from the capsule's vertical center
export const TITLE_TEXT_BASELINE_OFFSET = 9;
export const TYPELINE_TEXT_BASELINE_OFFSET = 7;

// Oracle text padding inside the box border
export const ORACLE_TEXT_PADDING_X = 8;
export const ORACLE_TEXT_PADDING_Y = 11;
// Bottom padding of the oracle text when the stats or loyalty box overlaps the box
export const ORACLE_TEXT_STATS_CLEARANCE = 26;
// Space above and below the oracle text of landscape cards, which have little room for it
export const LANDSCAPE_ORACLE_TEXT_PADDING_Y = 6;

// Center of the bottom of the planeswalker loyalty box
export const LOYALTY_BOX_X = 439;
export const LOYALTY_BOX_Y = 664;

/** Size of a card, and where its boxes go */
export interface CardLayout {
  width: number;
  height: number;
  titleY: number;
  titleWidth: number;
  contentWidth: number;
  artY: number;
  artHeight: number;
  typelineY: number;
  oracleY: number;
  oracleHeight: number;
  /** Middle of the bottom of the defense box, of battles */
  defenseX: number;
  defenseY: number;
  /** Space between the bottom of the card background and the bottom of the card */
  backgroundMarginBottom: number;
}

/** Layout of cards by orientation: portrait ones are 500x700, landscape ones 700x500 */
export const CARD_LAYOUTS: Record<Orientation, CardLayout> = {
  portrait: {
    width: 500,
    height: 700,
    titleY: TITLE_Y,
    titleWidth: TITLE_WIDTH,
    contentWidth: CONTENT_WIDTH,
    artY: ARTWORK_Y,
    artHeight: ARTWORK_HEIGHT,
    typelineY: TYPELINE_Y,
    oracleY: ORACLE_Y,
    oracleHeight: ORACLE_HEIGHT,
    defenseX: LOYALTY_BOX_X,
    defenseY: LOYALTY_BOX_Y,
    backgroundMarginBottom: 60,
  },
  landscape: {
    width: 700,
    height: 500,
    titleY: TITLE_Y,
    titleWidth: 650,
    contentWidth: 634,
    artY: ARTWORK_Y,
    artHeight: 200,
    typelineY: 273,
    oracleY: 317,
    oracleHeight: 138,
    defenseX: 660,
    defenseY: 490,
    backgroundMarginBottom: 52,
  },
};
