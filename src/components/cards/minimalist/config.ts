// Titles, stats, loyalty and planeswalker/saga text. Tahoma and Verdana come
// with Windows and macOS. Elsewhere (e.g. Android, Linux, ChromeOS), cards are
// drawn with the closest sans-serif fonts they have, rather than with serifs
const SANS_SERIF_FALLBACKS = "'DejaVu Sans', 'Noto Sans', Roboto, Arial, sans-serif";
export const DISPLAY_FONT_FAMILY = `Tahoma, Verdana, ${SANS_SERIF_FALLBACKS}`;
// Type lines and regular rules text
export const TEXT_FONT_FAMILY = `Verdana, ${SANS_SERIF_FALLBACKS}`;

export const TITLE_Y = 35;
export const TITLE_HEIGHT = 110;
export const TITLE_FONT_SIZE = 70;

export const PINLINE_THICKNESS = 5;

export const TYPELINE_Y = 170;
export const TYPELINE_HEIGHT = 50;
export const TYPELINE_FONT_SIZE = 22;

export const ORACLE_Y = 220;
export const ORACLE_HEIGHT = 375;
export const ORACLE_FONT_SIZE = 30;
// Oracle text starts this far below the top of the oracle box
export const ORACLE_TEXT_PADDING_TOP = 50;
// Extra oracle box height when the card has no stats line
export const ORACLE_EXTENDED_EXTRA = 40;
export const SAGA_ORACLE_EXTENDED_EXTRA = 30;

// Colored border on the left of planeswalker and saga oracle boxes
export const SIDE_BORDER_PADDING = 20;
export const SIDE_BORDER_WIDTH = 16;

export const STATSLINE_X = 429;
export const STATSLINE_Y = 654;
export const STATSLINE_HEIGHT = 40;
export const STATSLINE_FONT_SIZE = 40;

export const TITLE_WIDTH = 420;
export const TYPELINE_WIDTH = 440;
export const CONTENT_WIDTH = 410;

export const SUBCARD_TITLE_Y = ORACLE_Y + 15;
export const SUBCARD_TITLE_HEIGHT = 68;
export const SUBCARD_TITLE_FONT_SIZE = 32;

export const SUBCARD_TYPELINE_Y = ORACLE_Y + 100;
export const SUBCARD_TYPELINE_HEIGHT = 38;
export const SUBCARD_TYPELINE_FONT_SIZE = 18;

export const SUBCARD_ORACLE_Y = ORACLE_Y + 175;
export const SUBCARD_ORACLE_HEIGHT = ORACLE_HEIGHT - (SUBCARD_ORACLE_Y - ORACLE_Y);
export const SUBCARD_ORACLE_FONT_SIZE = 22;

// Center of the bottom of the planeswalker loyalty box
export const LOYALTY_BOX_X = 430;
export const LOYALTY_BOX_Y = 675;
export const LOYALTY_BOX_SCALE = 1.2;

/**
 * Where the card's footer starts, how wide it is, left of the stats and
 * loyalty boxes, the baseline of its bottom line, and its font size when it
 * fits
 */
export const FOOTER_X = 45;
export const FOOTER_WIDTH = 335;
export const FOOTER_Y = 682;
export const FOOTER_MAX_FONT_SIZE = 13;
