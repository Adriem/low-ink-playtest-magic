export const Colors = {
  COLORLESS: 'rgb(210,210,210)',
  // COLORLESS: 'rgb(145, 145, 145)',
  WHITE: 'rgb(213, 194, 167)',
  BLUE: 'rgb(41, 133, 225)',
  BLACK: 'rgb(105, 92, 114)',
  RED: 'rgb(211, 14, 14)',
  GREEN: 'rgb(6, 147, 45)',
  MULTI: 'rgb(239, 164, 0)',
  ARTIFACT: 'rgb(156,168,182)',
  // ARTIFACT: 'rgb(138,145,162)',
  // ARTIFACT: 'rgb(176, 184, 203)',
  LAND: 'rgb(143, 120, 90)',
};

export const getColorMappings = (cardColors, cardTypeLine) => {
  if (!cardColors) return '';
  if (cardColors.length === 0 && /artifact/i.test(cardTypeLine)) return 'artifact';
  if (cardColors.length === 0 && /land/i.test(cardTypeLine)) return 'land';
  if (cardColors.length === 0) return 'colorless';

  if (cardColors.length === 1 && cardColors.includes('W')) return 'white';
  if (cardColors.length === 1 && cardColors.includes('U')) return 'blue';
  if (cardColors.length === 1 && cardColors.includes('B')) return 'black';
  if (cardColors.length === 1 && cardColors.includes('R')) return 'red';
  if (cardColors.length === 1 && cardColors.includes('G')) return 'green';

  if (cardColors.length === 2 && cardColors.includes('W') && cardColors.includes('U')) return 'azorius';
  if (cardColors.length === 2 && cardColors.includes('W') && cardColors.includes('B')) return 'orzhov';
  if (cardColors.length === 2 && cardColors.includes('W') && cardColors.includes('R')) return 'boros';
  if (cardColors.length === 2 && cardColors.includes('W') && cardColors.includes('G')) return 'selesnya';
  if (cardColors.length === 2 && cardColors.includes('U') && cardColors.includes('B')) return 'dimir';
  if (cardColors.length === 2 && cardColors.includes('U') && cardColors.includes('R')) return 'izzet';
  if (cardColors.length === 2 && cardColors.includes('U') && cardColors.includes('G')) return 'simic';
  if (cardColors.length === 2 && cardColors.includes('B') && cardColors.includes('R')) return 'rakdos';
  if (cardColors.length === 2 && cardColors.includes('B') && cardColors.includes('G')) return 'golgari';
  if (cardColors.length === 2 && cardColors.includes('R') && cardColors.includes('G')) return 'gruul';

  if (cardColors.length > 2) return 'multi';
};

