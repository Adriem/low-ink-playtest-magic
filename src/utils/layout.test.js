import { distributeHeight } from './layout';

const sum = (values) => values.reduce((total, value) => total + value, 0);

test('splits the height proportionally to the weights', () => {
  const heights = distributeHeight(300, [
    { weight: 10, minHeight: 0 },
    { weight: 20, minHeight: 0 },
    { weight: 30, minHeight: 0 },
  ]);

  expect(heights).toEqual([50, 100, 150]);
});

test('gives items at least their minimum height, splitting the rest between the others', () => {
  const heights = distributeHeight(300, [
    { weight: 1, minHeight: 50 },
    { weight: 50, minHeight: 50 },
    { weight: 50, minHeight: 50 },
  ]);

  expect(heights[0]).toBe(50);
  expect(heights[1]).toBeCloseTo(125);
  expect(heights[2]).toBeCloseTo(125);
  expect(sum(heights)).toBeCloseTo(300);
});

test('splits the height equally, but with the required heights, when the minimums do not fit', () => {
  const heights = distributeHeight(200, [
    { weight: 1, minHeight: 75, requiredHeight: 95 },
    { weight: 10, minHeight: 75, requiredHeight: 0 },
    { weight: 50, minHeight: 75, requiredHeight: 0 },
  ]);

  expect(heights[0]).toBe(95);
  expect(heights[1]).toBeCloseTo(52.5);
  expect(heights[2]).toBeCloseTo(52.5);
});

test('splits the height equally when neither the minimums nor the required heights fit', () => {
  expect(distributeHeight(90, [
    { weight: 1, minHeight: 50, requiredHeight: 50 },
    { weight: 2, minHeight: 50, requiredHeight: 50 },
  ])).toEqual([45, 45]);
});

test('splits the height equally when the minimums do not fit and there are no required heights', () => {
  expect(distributeHeight(90, [
    { weight: 1, minHeight: 50 },
    { weight: 2, minHeight: 50 },
  ])).toEqual([45, 45]);
});
