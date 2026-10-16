import { jsPDF } from 'jspdf';
import { chunk } from '../../utils/array';
import { millimetersToInches } from '../../utils/unitConverter';

const CARD_WIDTH_INCHES = 2.5;
const CARD_HEIGHT_INCHES = 3.5;

const pageDimensionInches = {
  letter: { width: 8.5, height: 11 },
  a4: { width: millimetersToInches(210), height: millimetersToInches(297) },
};

type CardImage = string | HTMLImageElement | HTMLCanvasElement | Uint8Array;

/**
 * Generate a PDF with the images of the cards, as many as fit in each A4
 * page, and download it.
 *
 * @param cardImages - List of card images to be displayed
 * @param format - Format of file if filetype-recognition fails or in case of a
 *   Canvas-Element needs to be specified (default for Canvas is JPEG), e.g.
 *   'JPEG', 'PNG', 'WEBP'
 */
export const exportToPDF = (cardImages: Iterable<CardImage> | ArrayLike<CardImage>, format = 'JPG') => {
  const images = Array.from(cardImages);

  const colsPerPage = Math.floor(pageDimensionInches['a4'].width / CARD_WIDTH_INCHES);
  const rowsPerPage = Math.floor(pageDimensionInches['a4'].height / CARD_HEIGHT_INCHES);

  const xOffset = (pageDimensionInches['a4'].width - colsPerPage * CARD_WIDTH_INCHES) / 2;
  const yOffset = (pageDimensionInches['a4'].height - rowsPerPage * CARD_HEIGHT_INCHES) / 2;

  const cardRows = chunk(images, colsPerPage);
  const cardPages = chunk(cardRows, rowsPerPage);

  const doc = new jsPDF({
    unit: 'in',
    orientation: 'portrait',
    format: 'a4',
  });

  for (const [pageIndex, page] of cardPages.entries()) {
    if (pageIndex > 0) doc.addPage('a4', 'portrait');

    for (const [rowIndex, row] of page.entries()) {
      for (const [cardIndex, cardImage] of row.entries()) {
        const xOrigin = xOffset + cardIndex * CARD_WIDTH_INCHES;
        const yOrigin = yOffset + rowIndex * CARD_HEIGHT_INCHES;

        doc.addImage(cardImage, format, xOrigin, yOrigin, CARD_WIDTH_INCHES, CARD_HEIGHT_INCHES);
      }
    }
  }

  doc.save('press.pdf');
};
