import { jsPDF } from 'jspdf';
import { exportToPDF } from './exportToPdf';

vi.mock('jspdf', () => ({
  jsPDF: vi.fn(function () {
    return { addImage: vi.fn(), addPage: vi.fn(), save: vi.fn() };
  }),
}));

beforeEach(() => {
  vi.mocked(jsPDF).mockClear();
});

test('lays out the cards in A4 pages of 3x3 cards, in millimeters, and downloads it as mtg-playtest-press.pdf by default', () => {
  exportToPDF(cardImages(10));
  const pdf = createdPdf();

  expect(jsPDF).toHaveBeenCalledWith({ unit: 'mm', orientation: 'portrait', format: 'a4' });
  expect(pdf.addImage).toHaveBeenCalledTimes(10);
  expect(pdf.addPage).toHaveBeenCalledWith('a4', 'portrait');
  expect(pdf.save).toHaveBeenCalledWith('mtg-playtest-press.pdf');
});

test('draws each card at the size of real cards, centered in its page', () => {
  exportToPDF(cardImages(9));
  const positions = createdPdf().addImage.mock.calls.map(([, , x, y, width, height]) => [x, y, width, height]);

  // An A4 page is 210 x 297 mm, and cards are 63 x 88 mm
  const xOffset = (210 - 3 * 63) / 2;
  const yOffset = (297 - 3 * 88) / 2;
  expect(positions[0]).toEqual([xOffset, yOffset, 63, 88]);
  expect(positions[1]).toEqual([xOffset + 63, yOffset, 63, 88]);
  expect(positions[3]).toEqual([xOffset, yOffset + 88, 63, 88]);
  expect(positions[8]).toEqual([xOffset + 126, yOffset + 176, 63, 88]);
});

test('lays out letter pages, centering the cards in them', () => {
  exportToPDF(cardImages(10), { pageSize: 'letter', fileName: 'press' });
  const pdf = createdPdf();

  expect(jsPDF).toHaveBeenCalledWith({ unit: 'mm', orientation: 'portrait', format: 'letter' });
  expect(pdf.addPage).toHaveBeenCalledWith('letter', 'portrait');
  // A letter page is 215.9 x 279.4 mm, which also fits 3x3 cards
  expect(pdf.addImage.mock.calls[0].slice(2, 4)).toEqual([(215.9 - 3 * 63) / 2, (279.4 - 3 * 88) / 2]);
});

test('puts the cards drawn on canvases on white, so transparent corners come out white', () => {
  const drawn: unknown[][] = [];
  const ctx = {
    fillRect: (...args: unknown[]) => drawn.push(['fillRect', ctx.fillStyle, ...args]),
    drawImage: (...args: unknown[]) => drawn.push(['drawImage', ...args]),
    fillStyle: '',
  };
  const getContext = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(ctx as never);
  const card = document.createElement('canvas');
  card.width = 500;
  card.height = 700;

  exportToPDF([card]);
  getContext.mockRestore();

  expect(drawn).toEqual([
    ['fillRect', 'white', 0, 0, 500, 700],
    ['drawImage', card, 0, 0],
  ]);
  const [image] = createdPdf().addImage.mock.calls[0];
  expect(image).not.toBe(card);
  expect([image.width, image.height]).toEqual([500, 700]);
});

test('adds the cards as JPEG images', () => {
  exportToPDF(cardImages(1));

  expect(createdPdf().addImage.mock.calls[0].slice(0, 2)).toEqual(['card-0', 'JPEG']);
});

test.each([
  ['commander-deck', 'commander-deck.pdf'],
  ['deck.PDF', 'deck.PDF'],
  ['  ', 'mtg-playtest-press.pdf'],
])('downloads the file named %j as %j', (fileName, expected) => {
  exportToPDF(cardImages(1), { pageSize: 'a4', fileName });

  expect(createdPdf().save).toHaveBeenCalledWith(expected);
});

const createdPdf = () => {
  return vi.mocked(jsPDF).mock.results.at(-1)?.value as {
    addImage: ReturnType<typeof vi.fn>;
    addPage: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
  };
};

const cardImages = (count: number) => {
  return Array.from({ length: count }, (_, i) => `card-${i}`);
};
