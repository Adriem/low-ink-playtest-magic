import { testCard, testFace } from '../testUtils';
import {
  computeCardColors,
  getDefense,
  getLoyalty,
  getPowerAndToughness,
  getSubCardPosition,
  isArtifactType,
  isLandType,
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
