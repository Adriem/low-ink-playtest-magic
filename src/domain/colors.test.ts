import { isColorSymbol, normalizeColors, type ColorSymbol } from './colors';

test('recognizes the symbols of the five colors', () => {
  expect(['W', 'U', 'B', 'R', 'G'].every(isColorSymbol)).toBe(true);
  expect(['C', 'X', '2', 'w', ''].some(isColorSymbol)).toBe(false);
});

describe('normalizeColors', () => {
  const normalized = (colors: string) => {
    return normalizeColors([...colors] as ColorSymbol[]).join('');
  };

  test('keeps no colors and single colors as they are', () => {
    expect(normalizeColors([])).toEqual([]);
    expect(normalizeColors(['R'])).toEqual(['R']);
  });

  test('removes repeated colors', () => {
    expect(normalized('GG')).toBe('G');
    expect(normalized('WUW')).toBe('WU');
  });

  test.each([
    ['UW', 'WU'],
    ['BU', 'UB'],
    ['RB', 'BR'],
    ['GR', 'RG'],
    ['GW', 'WG'],
    ['BW', 'WB'],
    ['RU', 'UR'],
    ['GB', 'BG'],
    ['WR', 'RW'],
    ['GU', 'UG'],
  ])('puts the color pair %s in its usual order, %s', (colors, expected) => {
    expect(normalized(colors)).toBe(expected);
    expect(normalized(expected)).toBe(expected);
  });

  test.each([
    ['WUG', 'GWU'],
    ['BWU', 'WUB'],
    ['RUB', 'UBR'],
    ['GRB', 'BRG'],
    ['WGR', 'RGW'],
    ['WBR', 'RWB'],
    ['RUG', 'GUR'],
    ['GBW', 'WBG'],
    ['WRU', 'URW'],
    ['UGB', 'BGU'],
  ])('puts the three colors %s in their usual order, %s', (colors, expected) => {
    expect(normalized(colors)).toBe(expected);
  });

  test.each([
    ['RBUW', 'WUBR'],
    ['GRBU', 'UBRG'],
    ['WGRB', 'BRGW'],
    ['UWGR', 'RGWU'],
    ['BUWG', 'GWUB'],
  ])('puts the four colors %s in their usual order, %s', (colors, expected) => {
    expect(normalized(colors)).toBe(expected);
  });

  test('puts all five colors in WUBRG order', () => {
    expect(normalized('GRBUW')).toBe('WUBRG');
  });

  test('does not change the given colors', () => {
    const colors: ColorSymbol[] = ['G', 'W'];

    normalizeColors(colors);

    expect(colors).toEqual(['G', 'W']);
  });
});
