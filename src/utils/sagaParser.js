const SAGA_CHAPTER_REGEX = /^([IVX]+(?:\s*,\s*[IVX]+)*)\s*[—–]\s*(.+)$/;

/**
 * Parse a saga's oracle_text into paragraphs that appear before chapters,
 * the chapter blocks themselves, and paragraphs that appear after the
 * last chapter.
 *
 * @param {string} oracleText
 * @returns {{
 *   topParagraphs: string[],
 *   chapters: { labels: string[], text: string }[],
 *   bottomParagraphs: string[],
 * }}
 */
export const parseSagaOracleText = (oracleText) => {
  if (!oracleText) return { topParagraphs: [], chapters: [], bottomParagraphs: [] };

  const topParagraphs = [];
  const chapters = [];
  const bottomParagraphs = [];
  let seenChapter = false;

  for (const rawLine of oracleText.split('\n')) {
    const line = rawLine.trim();
    if (!line) continue;

    const match = line.match(SAGA_CHAPTER_REGEX);
    if (match) {
      const labels = match[1].split(',').map((s) => s.trim());
      const text = match[2].trim();
      chapters.push({ labels, text });
      seenChapter = true;
    } else if (seenChapter) {
      bottomParagraphs.push(line);
    } else {
      topParagraphs.push(line);
    }
  }

  return { topParagraphs, chapters, bottomParagraphs };
};
