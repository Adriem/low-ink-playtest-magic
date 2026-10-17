import { isLoyaltyAbility, isSagaChapter, type OracleParagraph, type OracleText } from '../../../domain/oracleText';

/** Text in a single style: italic for names and reminder text */
export type TextRun = { text: string; italic?: boolean };

/** A line of text, as runs of text in their styles. Empty lines separate paragraphs */
export type TextLine = TextRun[];

const MODE_PREFIX = '• ';
const NAME_SEPARATOR = ' — ';

/**
 * Paragraphs to draw for oracle text: each paragraph, followed by its modes
 * as "• " paragraphs. Chapter numbers and loyalty costs go before the text,
 * for boxes that don't draw them apart.
 */
export const toTextParagraphs = (paragraphs: OracleText['paragraphs']): TextRun[][] => {
  return paragraphs.flatMap((paragraph) => {
    const prefix = isSagaChapter(paragraph)
      ? `${paragraph.chapterNumbers.join(', ')}${NAME_SEPARATOR}`
      : isLoyaltyAbility(paragraph)
        ? `${paragraph.loyaltyCost}: `
        : '';

    const [text, ...modes] = toParagraphWithModes(paragraph);
    return [prefix ? [{ text: prefix }, ...text] : text, ...modes];
  });
};

/**
 * Runs of a paragraph, followed by a "• " paragraph for each of its modes.
 */
export const toParagraphWithModes = (paragraph: OracleParagraph): TextRun[][] => {
  return [
    toTextRuns(paragraph),
    ...(paragraph.modes ?? []).map((mode) => [{ text: MODE_PREFIX }, ...toTextRuns(mode)]),
  ];
};

/**
 * Runs of a paragraph: its name in italics, its rules text, then its
 * reminder text in italics.
 */
export const toTextRuns = ({ name, text, reminderText }: OracleParagraph): TextRun[] => {
  const runs: TextRun[] = [];
  if (name) runs.push({ text: name, italic: true }, { text: NAME_SEPARATOR });
  if (text) runs.push({ text });
  if (reminderText) runs.push(...(text ? [{ text: ' ' }] : []), { text: reminderText, italic: true });
  return runs;
};

/**
 * The text of some runs, without their styles.
 */
export const getRunsText = (runs: TextRun[]): string => {
  return runs.map((run) => run.text).join('');
};
