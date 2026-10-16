export interface SagaChapter {
  labels: string[];
  text: string;
}

export interface ParsedSaga {
  topParagraphs: string[];
  chapters: SagaChapter[];
  bottomParagraphs: string[];
}

const SAGA_CHAPTER_REGEX = /^([IVX]+(?:\s*,\s*[IVX]+)*)\s*[—–]\s*(.+)$/;

/**
 * Parse a saga's oracle text into paragraphs that appear before chapters,
 * the chapter blocks themselves, and paragraphs that appear after the
 * last chapter.
 *
 */
export const parseSagaOracleText = (oracleText?: string): ParsedSaga => {
  if (!oracleText) return { topParagraphs: [], chapters: [], bottomParagraphs: [] };

  const topParagraphs: string[] = [];
  const chapters: SagaChapter[] = [];
  const bottomParagraphs: string[] = [];
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

/**
 * Split the oracle text of a saga creature into its saga text (paragraphs
 * before the chapters and the chapters) and its creature abilities (the
 * paragraphs after the last chapter).
 *
 */
export const splitSagaCreatureText = (oracleText?: string) => {
  const { topParagraphs, chapters, bottomParagraphs } = parseSagaOracleText(oracleText);
  const chapterLines = chapters.map(({ labels, text }) => `${labels.join(', ')} — ${text}`);

  return {
    sagaText: [...topParagraphs, ...chapterLines].join('\n'),
    creatureText: bottomParagraphs.join('\n'),
  };
};
