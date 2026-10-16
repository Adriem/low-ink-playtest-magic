import { jsPDF } from 'jspdf';
import { exportToPDF } from './exportToPdf';

vi.mock('jspdf', () => ({
  jsPDF: vi.fn(function () {
    return { addImage: vi.fn(), addPage: vi.fn(), save: vi.fn() };
  }),
}));

const createdPdf = () => vi.mocked(jsPDF).mock.results.at(-1)?.value as {
  addImage: ReturnType<typeof vi.fn>,
  addPage: ReturnType<typeof vi.fn>,
  save: ReturnType<typeof vi.fn>,
};

const cardImages = (count: number) => Array.from({ length: count }, (_, i) => `card-${i}`);

beforeEach(() => {
  vi.mocked(jsPDF).mockClear();
});

test('lays out the cards in A4 pages of 3x3 cards, in inches, and downloads it', () => {
  exportToPDF(cardImages(10));
  const pdf = createdPdf();

  expect(jsPDF).toHaveBeenCalledWith({ unit: 'in', orientation: 'portrait', format: 'a4' });
  expect(pdf.addImage).toHaveBeenCalledTimes(10);
  expect(pdf.addPage).toHaveBeenCalledTimes(1);
  expect(pdf.save).toHaveBeenCalledWith('press.pdf');
});

test('draws each card at its actual size, centered in its page', () => {
  exportToPDF(cardImages(9));
  const positions = createdPdf().addImage.mock.calls.map(([, , x, y, width, height]) => [x, y, width, height]);

  // An A4 page is 8.27 x 11.69 inches, and cards are 2.5 x 3.5 inches
  const xOffset = (210 / 25.4 - 3 * 2.5) / 2;
  const yOffset = (297 / 25.4 - 3 * 3.5) / 2;
  expect(positions[0]).toEqual([xOffset, yOffset, 2.5, 3.5]);
  expect(positions[1]).toEqual([xOffset + 2.5, yOffset, 2.5, 3.5]);
  expect(positions[3]).toEqual([xOffset, yOffset + 3.5, 2.5, 3.5]);
  expect(positions[8]).toEqual([xOffset + 5, yOffset + 7, 2.5, 3.5]);
});

test('adds the cards as JPEG images unless told otherwise', () => {
  exportToPDF(cardImages(1));
  expect(createdPdf().addImage.mock.calls[0].slice(0, 2)).toEqual(['card-0', 'JPG']);

  exportToPDF(cardImages(1), 'PNG');
  expect(createdPdf().addImage.mock.calls[0].slice(0, 2)).toEqual(['card-0', 'PNG']);
});
