import { testFace } from '../testUtils';
import type { ColorSymbol } from './colors';
import { getCardColorTreatment, getColorTreatment, getPaletteColors, type Palette } from './colorTreatment';

describe('getColorTreatment', () => {
  test.each([
    [['W'], 'white'],
    [['U'], 'blue'],
    [['B'], 'black'],
    [['R'], 'red'],
    [['G'], 'green'],
  ] as [ColorSymbol[], string][])('%j is %s', (colors, treatment) => {
    expect(getColorTreatment(face(colors))).toBe(treatment);
  });

  test.each([
    [['W', 'U'], 'white-blue'],
    [['U', 'B'], 'blue-black'],
    [['B', 'R'], 'black-red'],
    [['R', 'G'], 'red-green'],
    [['G', 'W'], 'green-white'],
    [['W', 'B'], 'white-black'],
    [['U', 'R'], 'blue-red'],
    [['B', 'G'], 'black-green'],
    [['R', 'W'], 'red-white'],
    [['G', 'U'], 'green-blue'],
  ] as [ColorSymbol[], string][])('%j is %s, in either order', (colors, treatment) => {
    expect(getColorTreatment(face(colors))).toBe(treatment);
    expect(getColorTreatment(face([...colors].reverse()))).toBe(treatment);
  });

  test('ignores repeated colors', () => {
    expect(getColorTreatment(face(['G', 'G']))).toBe('green');
  });

  test('more than two colors are gold', () => {
    expect(getColorTreatment(face(['W', 'U', 'B']))).toBe('gold');
    expect(getColorTreatment(face(['W', 'U', 'B', 'R', 'G']))).toBe('gold');
  });

  test('colorless faces are artifacts, lands or colorless', () => {
    expect(getColorTreatment(face([], 'Artifact'))).toBe('artifact');
    expect(getColorTreatment(face([], 'Land'))).toBe('land');
    expect(getColorTreatment(face([], 'Creature — Eldrazi'))).toBe('colorless');
  });
});

describe('getCardColorTreatment', () => {
  test('two-color faces are gold, with pinlines in both colors', () => {
    expect(getCardColorTreatment(face(['R', 'W'], 'Instant', '{R}{W}'))).toEqual({
      pinlineColors: 'red-white',
      backgroundColors: 'gold',
    });
  });

  test('two-color faces are in both colors when every colored mana symbol of their cost is a hybrid of both', () => {
    expect(getCardColorTreatment(face(['W', 'G'], 'Creature', '{1}{G/W}{G/W}'))).toEqual({
      pinlineColors: 'green-white',
      backgroundColors: 'green-white',
    });
    expect(getCardColorTreatment(face(['U', 'R'], 'Instant', '{U/R}{U/R/P}')).backgroundColors).toBe('blue-red');
  });

  test('two-color faces are gold with other colored mana symbols, or without any', () => {
    expect(getCardColorTreatment(face(['R', 'W'], 'Instant', '{R/W}{W}')).backgroundColors).toBe('gold');
    expect(getCardColorTreatment(face(['W', 'B'], 'Sorcery', '{2/W}{2/B}')).backgroundColors).toBe('gold');
    expect(getCardColorTreatment(face(['B', 'G'], 'Land')).backgroundColors).toBe('gold');
  });

  test('other faces have the same colors throughout', () => {
    expect(getCardColorTreatment(face(['R'], 'Instant', '{R}'))).toEqual({
      pinlineColors: 'red',
      backgroundColors: 'red',
    });
    expect(getCardColorTreatment(face(['W', 'U', 'B']))).toEqual({ pinlineColors: 'gold', backgroundColors: 'gold' });
  });
});

const face = (colors: ColorSymbol[], typeLine = 'Creature', manaCost?: string) => {
  return testFace({ name: 'Card', colors, typeLine, manaCost });
};

describe('getPaletteColors', () => {
  const palette: Palette = {
    WHITE: 'w',
    BLUE: 'u',
    BLACK: 'b',
    RED: 'r',
    GREEN: 'g',
    COLORLESS: 'c',
    GOLD: 'm',
    ARTIFACT: 'a',
    LAND: 'l',
    TEXT: 'text',
    LINE: 'line',
    PAPER: 'paper',
  };

  test('uses a single color of the palette for single colors, gold and colorless treatments', () => {
    expect(getPaletteColors('red', palette)).toEqual(['r']);
    expect(getPaletteColors('gold', palette)).toEqual(['m']);
    expect(getPaletteColors('artifact', palette)).toEqual(['a']);
    expect(getPaletteColors('land', palette)).toEqual(['l']);
    expect(getPaletteColors('colorless', palette)).toEqual(['c']);
  });

  test('uses both colors of the palette for color pairs, in the order of the pair', () => {
    expect(getPaletteColors('green-white', palette)).toEqual(['g', 'w']);
    expect(getPaletteColors('white-blue', palette)).toEqual(['w', 'u']);
  });
});
