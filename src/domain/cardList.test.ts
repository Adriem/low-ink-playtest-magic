import { parseCardList } from './cardList';

/** The names and quantities of the entries of a card list */
const parse = (cardList: string) => {
  return parseCardList(cardList).map(({ cardName, quantity }) => [quantity, cardName]);
};

test('reads one card per line, with optional quantities, ignoring empty lines', () => {
  expect(parse('4 Lightning Bolt\n\n2x Counterspell\n  1X Island  \nColossal Dreadmaw')).toEqual([
    [4, 'Lightning Bolt'],
    [2, 'Counterspell'],
    [1, 'Island'],
    [1, 'Colossal Dreadmaw'],
  ]);
});

test('treats numbers too big to be a quantity as part of the card name', () => {
  expect(parse('1996 World Champion\n1 1996 World Champion')).toEqual([
    [1, '1996 World Champion'],
    [1, '1996 World Champion'],
  ]);
});

test('reads Arena lists, dropping sets and collector numbers', () => {
  const arenaList = ['4 Lightning Bolt (STA) 42', '20 Mountain (DMU) 269', '2 Abrade (DMU) 114'].join('\n');

  expect(parse(arenaList)).toEqual([
    [4, 'Lightning Bolt'],
    [20, 'Mountain'],
    [2, 'Abrade'],
  ]);
});

test('reads Moxfield lists, dropping sets, collector numbers and foil markers', () => {
  const moxfieldList = [
    '1 Sheoldred, the Apocalypse (DMU) 107 *F*',
    '1 Sol Ring (PLST) C21-263',
    '1 Lim-Dûl the Necromancer (TSB) 44 *E*',
    '1 Duress (STA) 28',
  ].join('\n');

  expect(parse(moxfieldList)).toEqual([
    [1, 'Sheoldred, the Apocalypse'],
    [1, 'Sol Ring'],
    [1, 'Lim-Dûl the Necromancer'],
    [1, 'Duress'],
  ]);
});

test('reads Archidekt lists, dropping categories and labels', () => {
  const archidektList = [
    '1x Sol Ring (cmm) 400 [Ramp]',
    '1x Swords to Plowshares (sta) 10 *F* [Removal,Instant] ^Have,#37d67a^',
    '1x Command Tower [Land]',
  ].join('\n');

  expect(parse(archidektList)).toEqual([
    [1, 'Sol Ring'],
    [1, 'Swords to Plowshares'],
    [1, 'Command Tower'],
  ]);
});

test('reads MTGO and MTGGoldfish lists, with their sideboard prefix', () => {
  expect(parse('4 Thoughtseize\nSB: 2 Duress\nSB:1 Pithing Needle')).toEqual([
    [4, 'Thoughtseize'],
    [2, 'Duress'],
    [1, 'Pithing Needle'],
  ]);
});

test('reads section headers as cards, which fail to load', () => {
  expect(parse('Deck\n4 Delver of Secrets\nSideboard (1)\n1 Duress')).toEqual([
    [1, 'Deck'],
    [4, 'Delver of Secrets'],
    [1, 'Sideboard (1)'],
    [1, 'Duress'],
  ]);
});

test('keeps the names of cards that look like the rest of a list', () => {
  expect(parse('Fire // Ice\nB.F.M. (Big Furry Monster)')).toEqual([
    [1, 'Fire // Ice'],
    [1, 'B.F.M. (Big Furry Monster)'],
  ]);
});

test('keeps the line each entry was read from', () => {
  expect(parseCardList('SB: 0 Duress (STA) 28')).toEqual([
    { line: 'SB: 0 Duress (STA) 28', cardName: 'Duress', quantity: 0 },
  ]);
});
