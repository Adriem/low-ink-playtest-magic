/**
 * The rules text of a card face, by line: abilities, saga chapters and
 * loyalty abilities, in order.
 */
export type OracleText = { lines: OracleLine[] };

/** A line of oracle text */
export type OracleLine = CardAbility | SagaChapter | LoyaltyAbility;

export type CardAbility = {
  /** Ability word or name of the ability, e.g. "Landfall" or "Mega Flare" */
  name?: string;
  /** Rules text, without the name and the reminder text */
  text: string;
  /** The explanation in parentheses at the end of the line, e.g. "(This creature can't be blocked.)" */
  reminderText?: string;
  /** Options to choose from, e.g. after "Choose one —" */
  modes?: CardAbility[];
};

export type SagaChapter = CardAbility & {
  /** Chapters the text is for, e.g. ["I", "II"] for "I, II — …" */
  chapterNumbers: string[];
};

export type LoyaltyAbility = CardAbility & {
  /** Loyalty added or removed to activate it, e.g. "+1", "0", "−3" or "−X" */
  loyaltyCost: string;
};

export const isSagaChapter = (line: OracleLine): line is SagaChapter => {
  return 'chapterNumbers' in line;
};

export const isLoyaltyAbility = (line: OracleLine): line is LoyaltyAbility => {
  return 'loyaltyCost' in line;
};

/**
 * The parts of a saga's text: the saga's abilities before its chapters (e.g.
 * the reminder about lore counters), its chapters, and the creature's
 * abilities after them, for saga creatures.
 */
export const getSagaParts = (oracleText: OracleText) => {
  const firstChapter = oracleText.lines.findIndex(isSagaChapter);
  const lastChapter = oracleText.lines.findLastIndex(isSagaChapter);
  if (firstChapter === -1) return { sagaAbilities: oracleText.lines, chapters: [], creatureAbilities: [] };

  return {
    sagaAbilities: oracleText.lines.slice(0, firstChapter),
    chapters: oracleText.lines.slice(firstChapter, lastChapter + 1).filter(isSagaChapter),
    creatureAbilities: oracleText.lines.slice(lastChapter + 1),
  };
};
