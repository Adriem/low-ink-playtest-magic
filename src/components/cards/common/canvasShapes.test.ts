import { getLoyaltyCostNumberOffset } from './canvasShapes';

test('places the number of loyalty costs lower in plus icons than in zero ones, and in those than in minus ones', () => {
  expect(getLoyaltyCostNumberOffset('+1')).toBe(10);
  expect(getLoyaltyCostNumberOffset('0')).toBe(7);
  expect(getLoyaltyCostNumberOffset('−3')).toBe(4);
  expect(getLoyaltyCostNumberOffset('−X')).toBe(4);
});

test('places the number of bigger icons further below their position', () => {
  expect(getLoyaltyCostNumberOffset('+1', 2)).toBe(-18 + 28 * 2);
});
