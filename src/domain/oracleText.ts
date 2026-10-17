/**
 * The rules text of a card face, by paragraph: regular paragraphs, saga
 * chapters and loyalty abilities, in order.
 */
export type OracleText = { paragraphs: (OracleParagraph | SagaChapter | LoyaltyAbility)[] };

export type OracleParagraph = {
  /** Ability word or name of the ability, e.g. "Landfall" or "Mega Flare" */
  name?: string;
  /** Rules text, without the name and the reminder text */
  text: string;
  /** The explanation in parentheses at the end of the paragraph, e.g. "(This creature can't be blocked.)" */
  reminderText?: string;
  /** Options to choose from, e.g. after "Choose one —" */
  modes?: OracleParagraph[];
};

export type SagaChapter = OracleParagraph & {
  /** Chapters the text is for, e.g. ["I", "II"] for "I, II — …" */
  chapterNumbers: string[];
};

export type LoyaltyAbility = OracleParagraph & {
  /** Loyalty added or removed to activate it, e.g. "+1", "0", "−3" or "−X" */
  loyaltyCost: string;
};

export const isSagaChapter = (paragraph: OracleParagraph): paragraph is SagaChapter => {
  return 'chapterNumbers' in paragraph;
};

export const isLoyaltyAbility = (paragraph: OracleParagraph): paragraph is LoyaltyAbility => {
  return 'loyaltyCost' in paragraph;
};

/**
 * The parts of a saga's text: the paragraphs before its chapters (e.g. the
 * reminder about lore counters), its chapters, and the paragraphs after them
 * (e.g. the abilities of saga creatures).
 */
export const getSagaParts = (oracleText: OracleText) => {
  const firstChapter = oracleText.paragraphs.findIndex(isSagaChapter);
  const lastChapter = oracleText.paragraphs.findLastIndex(isSagaChapter);
  if (firstChapter === -1) return { introduction: oracleText.paragraphs, chapters: [], conclusion: [] };

  return {
    introduction: oracleText.paragraphs.slice(0, firstChapter),
    chapters: oracleText.paragraphs.slice(firstChapter, lastChapter + 1).filter(isSagaChapter),
    conclusion: oracleText.paragraphs.slice(lastChapter + 1),
  };
};
