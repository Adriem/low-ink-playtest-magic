export const Colors = {
  COLORLESS: 'rgb(210,210,210)',
  WHITE: 'rgb(213, 194, 167)',
  BLUE: 'rgb(41, 133, 225)',
  BLACK: 'rgb(105, 92, 114)',
  RED: 'rgb(211, 14, 14)',
  GREEN: 'rgb(6, 147, 45)',
  MULTI: 'rgb(239, 164, 0)',
  ARTIFACT: 'rgb(156,168,182)',
  LAND: 'rgb(143, 120, 90)',
};

/**
 * Colors outside the color identity palettes: text and the structure of the
 * card (pinlines, frames, backgrounds), kept in one place to tune ink usage.
 */
export const InkColors = {
  TEXT: 'black',
  // e.g. the type line of colorless cards
  MUTED_TEXT: 'gray',
  // Pinlines, frames, dividers and other shapes
  LINE: 'black',
  // Background of the card and its boxes
  PAPER: 'white',
};

export const MinimalistColors = {
  COLORLESS: 'rgb(210,210,210)',
  WHITE: 'rgb(192,175,148)',
  BLUE: 'rgb(41, 133, 225)',
  BLACK: 'rgb(105, 92, 114)',
  RED: 'rgb(211, 14, 14)',
  GREEN: 'rgb(6, 147, 45)',
  MULTI: 'rgb(239, 164, 0)',
  ARTIFACT: 'rgb(160,173,185)',
  LAND: 'rgb(143, 120, 90)',
};

const COLOR_SYMBOLS = ['W', 'U', 'B', 'R', 'G'];

export const colorsFromManaCost = (manaCost = '') => {
  const found = new Set();
  for (const match of manaCost.matchAll(/\{([^}]+)\}/g)) {
    for (const part of match[1].split('/')) {
      if (COLOR_SYMBOLS.includes(part)) found.add(part);
    }
  }
  return [...found];
};

export const isArtifactType = (cardTypeLine) => {
  return /artifact/i.test(cardTypeLine)
}

export const isLandType = (cardTypeLine) => {
  return /land/i.test(cardTypeLine)
}

// Color identities of one and two colors, by their colors in WUBRG order
const COLOR_IDENTITIES = {
  W: 'white',
  U: 'blue',
  B: 'black',
  R: 'red',
  G: 'green',
  WU: 'azorius',
  WB: 'orzhov',
  WR: 'boros',
  WG: 'selesnya',
  UB: 'dimir',
  UR: 'izzet',
  UG: 'simic',
  BR: 'rakdos',
  BG: 'golgari',
  RG: 'gruul',
};

/**
 * Color identity of a card, used to pick its frame colors.
 *
 * @param {string[]} [cardColors] - e.g. `['W', 'U']`
 * @param {string} [cardTypeLine]
 * @returns {string|undefined} e.g. `azorius`, `multi`, `artifact` or
 *   `colorless`; empty without colors, undefined for invalid colors
 */
export const getColorMappings = (cardColors, cardTypeLine) => {
  if (!cardColors) return '';

  if (cardColors.length === 0) {
    if (isArtifactType(cardTypeLine)) return 'artifact';
    if (isLandType(cardTypeLine)) return 'land';
    return 'colorless';
  }

  if (cardColors.length > 2) return 'multi';

  const colorsInWubrgOrder = [...cardColors]
    .sort((a, b) => COLOR_SYMBOLS.indexOf(a) - COLOR_SYMBOLS.indexOf(b))
    .join('');
  return COLOR_IDENTITIES[colorsInWubrgOrder];
};

