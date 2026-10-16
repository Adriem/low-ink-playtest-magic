const ColorSymbols = ['W', 'U', 'B', 'R', 'G'] as const;
const TwoColorPairs = ['WU', 'UB', 'BR', 'RG', 'WG', 'WB', 'UR', 'BG', 'RW', 'UG'] as const;
const ThreeColorPairs = ['GWU', 'WUB', 'UBR', 'BRG', 'RGW', 'RWB', 'GUR', 'WBG', 'URW', 'BGU'] as const;
const FourColorPairs = ['WUBR', 'UBRG', 'BRGW', 'RGWU', 'GWUB'] as const;

export type ColorSymbol = (typeof ColorSymbols)[number];
export type ColorPair = (typeof TwoColorPairs)[number];

export const isColorSymbol = (str: string): str is ColorSymbol => {
  return (ColorSymbols as readonly string[]).includes(str);
};

export const normalizeColors = (colors: readonly ColorSymbol[]): ColorSymbol[] => {
  const dedupedColors = [...new Set(colors)];
  switch (dedupedColors.length) {
    case 0:
    case 1:
      return dedupedColors;
    case 2:
      return normalizeColorPair(dedupedColors, TwoColorPairs);
    case 3:
      return normalizeColorPair(dedupedColors, ThreeColorPairs);
    case 4:
      return normalizeColorPair(dedupedColors, FourColorPairs);
    case 5:
      return [...ColorSymbols];
    default:
      throw new Error(`Unknown color in ${dedupedColors.join('')}`);
  }
};

const normalizeColorPair = (
  colors: readonly ColorSymbol[],
  ColorPairingRef: typeof TwoColorPairs | typeof ThreeColorPairs | typeof FourColorPairs,
): ColorSymbol[] => {
  for (const pairing of ColorPairingRef) {
    if ([...pairing].every((color) => colors.includes(color as ColorSymbol))) {
      return pairing.split('') as [ColorSymbol, ColorSymbol];
    }
  }

  return [...colors];
};
