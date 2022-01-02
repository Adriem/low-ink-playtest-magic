import { jsPDF } from 'jspdf';
import { chunk } from './array';
import { millimetersToInches } from './unitConverter';

const CARD_WIDTH_INCHES = 2.5;
const CARD_HEIGHT_INCHES = 3.5;

const pageDimensionInches = {
  'letter': { width: 8.5, height: 11 },
  'a4': { width: millimetersToInches(210), height: millimetersToInches(297) },
};

/**
 * Generate a PDF from a list of images
 *
 * @param {Array<
 *   string
 *   | HTMLImageElement
 *   | HTMLCanvasElement
 *   | Uint8Array
 *   | RGBAData
 * >} cardImages - List of card images to be displayed
 * @param {string} format - Format of file if filetype-recognition fails or in case of a
 *                          Canvas-Element needs to be specified (default for Canvas is JPEG),
 *                          e.g. 'JPEG', 'PNG', 'WEBP'
 */
const exportToPDF = (cardImages, format = 'JPG') => {
  const colsPerPage = Math.floor(pageDimensionInches['a4'].width / CARD_WIDTH_INCHES);
  const rowsPerPage = Math.floor(pageDimensionInches['a4'].height / CARD_HEIGHT_INCHES);

  const xOffset = (pageDimensionInches['a4'].width - colsPerPage * CARD_WIDTH_INCHES) / 2;
  const yOffset = (pageDimensionInches['a4'].height - rowsPerPage * CARD_HEIGHT_INCHES) / 2;

  const cardRows = chunk(cardImages, colsPerPage);
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

export default exportToPDF;