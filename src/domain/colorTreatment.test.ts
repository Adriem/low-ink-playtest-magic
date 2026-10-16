import { testFace } from '../testUtils';
import type { ColorSymbol } from './colors';
import { getColorTreatment, getPaletteColors, type Palette } from './colorTreatment';

const face = (colors: ColorSymbol[], typeLine = 'Creature') => testFace({ name: 'Card', colors, typeLine });

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

  test('more than two colors are multicolored', () => {
    expect(getColorTreatment(face(['W', 'U', 'B']))).toBe('multi');
    expect(getColorTreatment(face(['W', 'U', 'B', 'R', 'G']))).toBe('multi');
  });

  test('colorless faces are artifacts, lands or colorless', () => {
    expect(getColorTreatment(face([], 'Artifact'))).toBe('artifact');
    expect(getColorTreatment(face([], 'Land'))).toBe('land');
    expect(getColorTreatment(face([], 'Creature — Eldrazi'))).toBe('colorless');
  });
});

describe('getPaletteColors', () => {
  const palette: Palette = {
    WHITE: 'w',
    BLUE: 'u',
    BLACK: 'b',
    RED: 'r',
    GREEN: 'g',
    COLORLESS: 'c',
    MULTI: 'm',
    ARTIFACT: 'a',
    LAND: 'l',
    TEXT: 'text',
    LINE: 'line',
    PAPER: 'paper',
  };

  test('uses a single color of the palette for single colors, multicolored and colorless treatments', () => {
    expect(getPaletteColors('red', palette)).toEqual(['r']);
    expect(getPaletteColors('multi', palette)).toEqual(['m']);
    expect(getPaletteColors('artifact', palette)).toEqual(['a']);
    expect(getPaletteColors('land', palette)).toEqual(['l']);
    expect(getPaletteColors('colorless', palette)).toEqual(['c']);
  });

  test('uses both colors of the palette for color pairs, in the order of the pair', () => {
    expect(getPaletteColors('green-white', palette)).toEqual(['g', 'w']);
    expect(getPaletteColors('white-blue', palette)).toEqual(['w', 'u']);
  });
});
