import { getSymbolValue, parseTextWithSymbols, splitSymbols } from './symbols';

describe('splitSymbols', () => {
  test('gets the symbols of a text, in order', () => {
    expect(splitSymbols('{2}{W}{U}')).toEqual(['{2}', '{W}', '{U}']);
    expect(splitSymbols('{T}: Add {G}.')).toEqual(['{T}', '{G}']);
  });

  test('keeps hybrid and Phyrexian symbols whole', () => {
    expect(splitSymbols('{R/G}{U/P}')).toEqual(['{R/G}', '{U/P}']);
  });

  test('gets no symbols from texts without them', () => {
    expect(splitSymbols('Flying')).toEqual([]);
    expect(splitSymbols('')).toEqual([]);
  });
});

describe('parseTextWithSymbols', () => {
  test('splits a text into runs of text and runs of symbols, in order', () => {
    expect(parseTextWithSymbols('{T}: Add {G}{G}.')).toEqual([
      { chunkType: 'symbols', value: '{T}' },
      { chunkType: 'text', value: ': Add ' },
      { chunkType: 'symbols', value: '{G}{G}' },
      { chunkType: 'text', value: '.' },
    ]);
  });

  test('keeps texts without symbols, or only with symbols, in a single chunk', () => {
    expect(parseTextWithSymbols('Flying')).toEqual([{ chunkType: 'text', value: 'Flying' }]);
    expect(parseTextWithSymbols('{2}{W}')).toEqual([{ chunkType: 'symbols', value: '{2}{W}' }]);
  });

  test('has no chunks for an empty text', () => {
    expect(parseTextWithSymbols('')).toEqual([]);
  });
});

test('gets what a symbol stands for, without its braces', () => {
  expect(getSymbolValue('{T}')).toBe('T');
  expect(getSymbolValue('{U/P}')).toBe('U/P');
  expect(getSymbolValue('{10}')).toBe('10');
});
