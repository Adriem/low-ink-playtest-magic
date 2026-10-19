import { jsPDF } from 'jspdf';
import { chunk } from '../../utils/array';

/** Size of a card, as real cards measure (nominally 2.5 x 3.5 inches, or 63.5 x 88.9 mm) */
const CARD_WIDTH_MM = 63;
const CARD_HEIGHT_MM = 88;

export type PageSize = 'a4' | 'letter';

/** How a PDF is exported */
export interface PdfExportOptions {
  pageSize: PageSize;
  /** Name of the downloaded file, with or without its `.pdf` extension */
  fileName: string;
}

export const DEFAULT_PDF_EXPORT_OPTIONS: PdfExportOptions = { pageSize: 'a4', fileName: 'mtg-playtest-press' };

const PAGE_DIMENSIONS_MM: Record<PageSize, { width: number; height: number }> = {
  a4: { width: 210, height: 297 },
  letter: { width: 215.9, height: 279.4 },
};

type CardImage = string | HTMLImageElement | HTMLCanvasElement | Uint8Array;

/**
 * Generate a PDF with the images of the cards, at their actual size and as
 * many as fit in each page, and download it. Cards drawn on canvases are put
 * on white, so their transparent corners print white: JPEG has no
 * transparency, so they would turn black.
 *
 * @param cardImages - List of card images to be displayed
 */
export const exportToPDF = (
  cardImages: Iterable<CardImage> | ArrayLike<CardImage>,
  { pageSize, fileName }: PdfExportOptions = DEFAULT_PDF_EXPORT_OPTIONS,
) => {
  const images = Array.from(cardImages, (image) => (image instanceof HTMLCanvasElement ? onWhite(image) : image));
  const page = PAGE_DIMENSIONS_MM[pageSize];

  const colsPerPage = Math.floor(page.width / CARD_WIDTH_MM);
  const rowsPerPage = Math.floor(page.height / CARD_HEIGHT_MM);

  const xOffset = (page.width - colsPerPage * CARD_WIDTH_MM) / 2;
  const yOffset = (page.height - rowsPerPage * CARD_HEIGHT_MM) / 2;

  const cardRows = chunk(images, colsPerPage);
  const cardPages = chunk(cardRows, rowsPerPage);

  const doc = new jsPDF({ unit: 'mm', orientation: 'portrait', format: pageSize });

  for (const [pageIndex, pageRows] of cardPages.entries()) {
    if (pageIndex > 0) doc.addPage(pageSize, 'portrait');

    for (const [rowIndex, row] of pageRows.entries()) {
      for (const [cardIndex, cardImage] of row.entries()) {
        const xOrigin = xOffset + cardIndex * CARD_WIDTH_MM;
        const yOrigin = yOffset + rowIndex * CARD_HEIGHT_MM;

        // Always JPEG: lossless PNG looks no different at the ~200 dpi the cards print at, but makes bigger
        // files, and jsPDF gives PNG images a transparency mask that some viewers draw softer. PDFs can't
        // hold WebP or AVIF (jsPDF re-encodes them as JPEG), and JPEG 2000 and JPEG XL aren't widely
        // supported or written by jsPDF.
        doc.addImage(cardImage, 'JPEG', xOrigin, yOrigin, CARD_WIDTH_MM, CARD_HEIGHT_MM);
      }
    }
  }

  doc.save(toPdfFileName(fileName));
};

/**
 * A copy of a canvas drawn on white, or the canvas itself when it can't be
 * copied.
 */
const onWhite = (canvas: HTMLCanvasElement): HTMLCanvasElement => {
  const copy = document.createElement('canvas');
  copy.width = canvas.width;
  copy.height = canvas.height;
  const ctx = copy.getContext('2d');
  if (!ctx) return canvas;

  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, copy.width, copy.height);
  ctx.drawImage(canvas, 0, 0);
  return copy;
};

/**
 * File name with the `.pdf` extension, or the default one when blank.
 */
const toPdfFileName = (fileName: string): string => {
  const name = fileName.trim() || DEFAULT_PDF_EXPORT_OPTIONS.fileName;
  return name.toLowerCase().endsWith('.pdf') ? name : `${name}.pdf`;
};
