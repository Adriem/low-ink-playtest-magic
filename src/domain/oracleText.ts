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

const MODE_PREFIX = '• ';
const SAGA_CHAPTER_REGEX = /^([IVX]+(?:\s*,\s*[IVX]+)*)\s*[—–]\s*(.+)$/;
const LOYALTY_ABILITY_REGEX = /^([+−-]?(?:\d+|X)):\s*(.+)$/;
// Ability words and names of abilities: a short phrase without punctuation before " — "
const NAME_REGEX = /^([A-Z][^—•(){}.,:;+]{0,40}?) — (.+)$/;

/**
 * Parse the rules text of a card face, as Scryfall writes it: one paragraph
 * per line, with "•" lines being modes of the paragraph above.
 */
export const parseOracleText = (oracleText = ''): OracleText => {
  const paragraphs: OracleText['paragraphs'] = [];

  for (const rawLine of oracleText.split('\n')) {
    const line = rawLine.trim();
    if (!line) continue;

    const previous = paragraphs.at(-1);
    if (line.startsWith(MODE_PREFIX) && previous) {
      previous.modes = [...(previous.modes ?? []), parseParagraph(line.slice(MODE_PREFIX.length))];
      continue;
    }

    paragraphs.push(parseLine(line));
  }

  return { paragraphs };
};

const parseLine = (line: string): OracleParagraph | SagaChapter | LoyaltyAbility => {
  const chapter = line.match(SAGA_CHAPTER_REGEX);
  if (chapter) {
    const chapterNumbers = chapter[1].split(',').map((number) => number.trim());
    return { chapterNumbers, ...parseParagraph(chapter[2]) };
  }

  const loyaltyAbility = line.match(LOYALTY_ABILITY_REGEX);
  if (loyaltyAbility) return { loyaltyCost: loyaltyAbility[1], ...parseParagraph(loyaltyAbility[2]) };

  return parseParagraph(line);
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

/**
 * A paragraph, with its name and reminder text apart from its rules text.
 * Only a parenthetical at the end of the paragraph is reminder text: ones in
 * the middle of it are part of the rules (e.g. "costs {U} (or {1}) less").
 */
const parseParagraph = (line: string): OracleParagraph => {
  const named = line.match(NAME_REGEX);
  const name = named?.[1];
  const body = named ? named[2] : line;

  const reminderStart = findTrailingParenthetical(body);
  const text = reminderStart === -1 ? body : body.slice(0, reminderStart).trimEnd();
  const reminderText = reminderStart === -1 ? undefined : body.slice(reminderStart);

  return {
    ...(name ? { name } : {}),
    text,
    ...(reminderText ? { reminderText } : {}),
  };
};

/**
 * Where the parenthetical that ends a text starts, or -1 if it doesn't end
 * with one.
 */
const findTrailingParenthetical = (text: string) => {
  if (!text.endsWith(')')) return -1;

  let depth = 0;
  for (let i = text.length - 1; i >= 0; i--) {
    if (text[i] === ')') depth++;
    if (text[i] === '(') depth--;
    if (depth === 0) return i;
  }
  return -1;
};
