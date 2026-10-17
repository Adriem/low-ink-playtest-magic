import { isLoyaltyAbility, isSagaChapter, type CardAbility, type OracleLine } from '../../../domain/oracleText';

/** Text in a single style: italic for names and reminder text */
export type TextRun = { text: string; italic?: boolean };

/** A line of text, as runs of text in their styles. Empty lines separate paragraphs */
export type TextLine = TextRun[];

const MODE_PREFIX = '• ';
const NAME_SEPARATOR = ' — ';

/**
 * Paragraphs to draw for the lines of oracle text: each line, followed by its
 * modes as "• " paragraphs. Chapter numbers and loyalty costs go before the
 * text, for boxes that don't draw them apart.
 */
export const toTextParagraphs = (lines: OracleLine[]): TextRun[][] => {
  return lines.flatMap((line) => {
    const prefix = isSagaChapter(line)
      ? `${line.chapterNumbers.join(', ')}${NAME_SEPARATOR}`
      : isLoyaltyAbility(line)
        ? `${line.loyaltyCost}: `
        : '';

    const [text, ...modes] = toAbilityParagraphs(line);
    return [prefix ? [{ text: prefix }, ...text] : text, ...modes];
  });
};

/**
 * Paragraphs to draw for an ability: its runs, followed by a "• " paragraph
 * for each of its modes.
 */
export const toAbilityParagraphs = (ability: CardAbility): TextRun[][] => {
  return [toTextRuns(ability), ...(ability.modes ?? []).map((mode) => [{ text: MODE_PREFIX }, ...toTextRuns(mode)])];
};

/**
 * Runs of an ability: its name in italics, its rules text, then its reminder
 * text in italics.
 */
export const toTextRuns = ({ name, text, reminderText }: CardAbility): TextRun[] => {
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
