import { testCard, testFace } from '../testUtils';
import {
  computeCardColors,
  getArtists,
  getDefense,
  getLoyalty,
  getPowerAndToughness,
  getSubCardPosition,
  isArtifactType,
  isLandType,
  clearArtOverrides,
  getDrawnArt,
  overrideArt,
} from './cards';

describe('computeCardColors', () => {
  test('gets the colors of the mana symbols, once each', () => {
    expect(computeCardColors({ manaCost: '{2}{G}{G}' })).toEqual(['G']);
    expect(computeCardColors({ manaCost: '{1}{W}{U}' })).toEqual(['W', 'U']);
  });

  test('gets both colors of hybrid symbols, and the color of Phyrexian ones', () => {
    expect(computeCardColors({ manaCost: '{R/G}{2/W}{B/P}' })).toEqual(['R', 'G', 'W', 'B']);
  });

  test('has no colors without colored symbols or a mana cost', () => {
    expect(computeCardColors({ manaCost: '{X}{C}{3}' })).toEqual([]);
    expect(computeCardColors({})).toEqual([]);
  });
});

test('tells artifacts and lands apart by their type line', () => {
  expect(isArtifactType(testFace({ name: 'Sol Ring', typeLine: 'Artifact' }))).toBe(true);
  expect(isLandType(testFace({ name: 'Dryad Arbor', typeLine: 'Land Creature — Forest Dryad' }))).toBe(true);
  expect(isArtifactType(testFace({ name: 'Colossal Dreadmaw', typeLine: 'Creature — Dinosaur' }))).toBe(false);
});

test('gets the side of the sub-card from the layout of the card', () => {
  expect(getSubCardPosition(testCard({ name: 'Bonecrusher Giant', layout: 'subcard-left' }))).toBe('left');
  expect(getSubCardPosition(testCard({ name: 'A prepare card', layout: 'subcard-right' }))).toBe('right');
  expect(getSubCardPosition(testCard({ name: 'Fire // Ice', layout: 'split' }))).toBeUndefined();
});

test('gets the stats of a face', () => {
  const creature = testFace({ name: 'Colossal Dreadmaw', stats: { power: '6', toughness: '6' } });
  const planeswalker = testFace({ name: 'Jace', stats: { loyalty: '3' } });

  expect(getPowerAndToughness(creature)).toEqual({ power: '6', toughness: '6' });
  expect(getLoyalty(creature)).toBeUndefined();
  expect(getLoyalty(planeswalker)).toBe('3');
  expect(getPowerAndToughness(planeswalker)).toBeUndefined();
  expect(getDefense(testFace({ name: 'Invasion of Ravnica', stats: { defense: '4' } }))).toBe('4');
  expect(getDefense(planeswalker)).toBeUndefined();
});

test('credits the artists of faces each once, joined with " & "', () => {
  const byGuay = testFace({ name: 'Front', artist: 'Rebecca Guay' });
  const byMartin = testFace({ name: 'Back', artist: 'David Martin' });

  expect(getArtists([byGuay, byMartin])).toBe('Rebecca Guay & David Martin');
  expect(getArtists([byGuay, testFace({ name: 'Back', artist: 'Rebecca Guay' })])).toBe('Rebecca Guay');
  expect(getArtists([byGuay, testFace({ name: 'Back' })])).toBe('Rebecca Guay');
  expect(getArtists([testFace({ name: 'Front' })])).toBeUndefined();
});

describe('art overrides', () => {
  const splitCard = testCard({
    name: 'Fire // Ice',
    layout: 'split',
    mainFace: testFace({ name: 'Fire', art: { assetUrl: 'fire-ice.jpg', crop: { from: 0, to: 0.5 } } }),
    secondaryFace: testFace({ name: 'Ice', art: { assetUrl: 'fire-ice.jpg', crop: { from: 0.5, to: 1 } } }),
  });

  test('overrides both faces with one image, each with its own part of it, filling its art box', () => {
    const card = overrideArt(splitCard, { kind: 'unified', url: 'mine.jpg' }, 'contours');

    expect([card.mainFace.artOverride, card.secondaryFace?.artOverride]).toEqual([
      { url: 'mine.jpg', crop: { from: 0, to: 0.5, cover: true }, fidelity: 'contours', artist: 'unknown' },
      { url: 'mine.jpg', crop: { from: 0.5, to: 1, cover: true }, fidelity: 'contours', artist: 'unknown' },
    ]);
  });

  test('overrides each face with an image of its own, whole, and keeps the art of faces without one', () => {
    const card = overrideArt(splitCard, { kind: 'split', urls: [undefined, 'ice.jpg'] }, 'posterized');

    expect(card.mainFace.artOverride).toBeUndefined();
    expect(card.secondaryFace?.artOverride).toEqual({
      url: 'ice.jpg',
      crop: { from: 0, to: 1, cover: true },
      fidelity: 'posterized',
      artist: 'unknown',
    });
  });

  test("credits the overrides' artist instead of the faces' own, or an unknown one", () => {
    const fire = { ...splitCard.mainFace, artist: 'Dan Frazier' };
    const ice = { ...splitCard.secondaryFace!, artist: 'Dan Frazier' };
    const card = overrideArt(
      { ...splitCard, mainFace: fire, secondaryFace: ice },
      { kind: 'split', urls: [undefined, 'ice.jpg'] },
      'contours',
      '  Jane Doe ',
    );

    expect(card.secondaryFace?.artOverride?.artist).toBe('Jane Doe');
    expect(getArtists([card.mainFace, card.secondaryFace!])).toBe('Dan Frazier & Jane Doe');
    expect(overrideArt(splitCard, { kind: 'unified', url: 'mine.jpg' }, 'contours').mainFace.artOverride?.artist).toBe(
      'unknown',
    );
  });

  test('clears the overrides of every face', () => {
    const card = clearArtOverrides(overrideArt(splitCard, { kind: 'unified', url: 'mine.jpg' }, 'contours'));

    expect([card.mainFace.artOverride, card.secondaryFace?.artOverride]).toEqual([undefined, undefined]);
  });

  test("draws a face with its override's art, or with its own", () => {
    const card = overrideArt(splitCard, { kind: 'split', urls: ['fire.jpg'] }, 'contours');

    expect(getDrawnArt(card.mainFace)).toEqual({ assetUrl: 'fire.jpg', crop: { from: 0, to: 1, cover: true } });
    expect(getDrawnArt(card.secondaryFace!)).toEqual(splitCard.secondaryFace!.art);
  });
});
