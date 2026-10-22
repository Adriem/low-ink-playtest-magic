import { getCroppedArea } from './drawArtImage';

const image = { naturalWidth: 1000, naturalHeight: 500 };

test("draws the crop's span of the image, stretched to its area", () => {
  expect(getCroppedArea(image, { from: 0.5, to: 1 }, 1)).toEqual({ x: 500, y: 0, width: 500, height: 500 });
});

test('crops images wider than their area to its middle, with its proportions', () => {
  expect(getCroppedArea(image, { from: 0, to: 1, cover: true }, 1)).toEqual({ x: 250, y: 0, width: 500, height: 500 });
});

test('crops images taller than their area to its middle, with its proportions', () => {
  expect(getCroppedArea(image, { from: 0, to: 1, cover: true }, 4)).toEqual({ x: 0, y: 125, width: 1000, height: 250 });
});
