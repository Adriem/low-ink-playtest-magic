/** Most copies of a card a line of a card list can ask for */
export const MAX_QUANTITY = 100;

// e.g. "4 Lightning Bolt", "2x Counterspell", "1X Colossal Dreadmaw"
const QUANTITY_PREFIX_REGEX = /^(\d+)\s*[xX]?\s+(.+)$/;
// Sideboard cards in MTGO and MTGGoldfish lists, e.g. "SB: 2 Duress"
const SIDEBOARD_PREFIX_REGEX = /^SB:\s*/i;
// What lists add after the name of a card, from the end of the line:
// - Archidekt's categories and labels, e.g. "[Removal]", "^Have,#37d67a^"
// - foil and etched markers, e.g. "*F*", "*E*"
// - the set and collector number of the printing, e.g. "(STA) 42", "[DMU] 107", "(PLST) LRW-21"
const TRAILING_DETAILS_REGEXES = [
  /\s+\^[^^]*\^$/,
  /\s+\[[^\]]*\]$/,
  /\s+\*[A-Z]+\*$/i,
  /\s+[([][A-Za-z0-9]{2,6}[)\]](\s+[A-Za-z0-9★†-]+)?$/,
];

export interface CardListEntry {
  /** Line of the card list it was parsed from */
  line: string;
  cardName: string;
  quantity: number;
}

/**
 * Turn a card list into entries, one per line, ignoring empty lines. The
 * card lines of lists exported by deck builders (Arena, Moxfield, Archidekt,
 * MTGO, MTGGoldfish) work as they're copied: the sideboard prefix, and the
 * set, collector number, foil markers and categories of each card, are
 * dropped, as only names are looked up. Other lines, such as section headers
 * (e.g. "Sideboard"), are read as cards, which fail to load.
 */
export const parseCardList = (cardList: string): CardListEntry[] => {
  return cardList
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map(parseCardListLine);
};

/**
 * Parse a line of a card list: an optional quantity, the card name, and the
 * details lists add after it. Numbers too big to be a quantity are part of
 * the name (e.g. "1996 World Champion"), so such cards need an explicit
 * quantity ("1 1996 World Champion").
 */
const parseCardListLine = (line: string): CardListEntry => {
  const card = line.replace(SIDEBOARD_PREFIX_REGEX, '');
  const match = card.match(QUANTITY_PREFIX_REGEX);
  const quantity = match ? Number(match[1]) : 1;

  if (!match || quantity > MAX_QUANTITY) return { line, cardName: withoutTrailingDetails(card), quantity: 1 };
  return { line, cardName: withoutTrailingDetails(match[2]), quantity };
};

const withoutTrailingDetails = (card: string): string => {
  let name = card.trim();
  let previous;
  do {
    previous = name;
    TRAILING_DETAILS_REGEXES.forEach((regex) => (name = name.replace(regex, '')));
  } while (name !== previous);
  return name.trim();
};
