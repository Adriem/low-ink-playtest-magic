import { useCallback, useState, type FormEvent, type KeyboardEvent } from 'react';

import './CardSearchForm.css';

const MAX_QUANTITY = 100;
// e.g. "4 Lightning Bolt", "2x Counterspell", "1X Colossal Dreadmaw"
const QUANTITY_PREFIX_REGEX = /^(\d+)\s*[xX]?\s+(.+)$/;

interface CardListEntry {
  /** Line of the card list it was parsed from */
  line: string;
  cardName: string;
  quantity: number;
}

type SearchModeChangeHandler = (multipleSearch: boolean) => void;

/**
 * Parse a line of the card list: an optional quantity followed by the card
 * name. Numbers too big to be a quantity are part of the name (e.g. "1996
 * World Champion"), so such cards need an explicit quantity ("1 1996 World
 * Champion").
 */
const parseCardListLine = (line: string): CardListEntry => {
  const match = line.match(QUANTITY_PREFIX_REGEX);
  const quantity = match ? Number(match[1]) : 1;

  if (!match || quantity > MAX_QUANTITY) return { line, cardName: line, quantity: 1 };
  return { line, cardName: match[2].trim(), quantity };
};

/**
 * Turn the content of the card list textarea into entries: one card per line,
 * ignoring empty lines.
 */
const parseCardList = (cardList: string): CardListEntry[] =>
  cardList
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map(parseCardListLine);

const repeatCardName = (cardName: string, quantity: number) => Array.from({ length: quantity }, () => cardName);

/**
 * Radio buttons to switch between adding a single card and a card list.
 *
 * @param props.multipleSearch - Whether the card list mode is selected
 */
const SearchModeToggle = ({
  multipleSearch,
  onChange,
}: {
  multipleSearch: boolean;
  onChange: SearchModeChangeHandler;
}) => (
  <div
    className={`search-mode ${multipleSearch ? 'list' : 'single'}`}
    role="radiogroup"
    aria-labelledby="search-mode-label"
  >
    <span id="search-mode-label">Search mode:</span>
    <label>
      <input type="radio" name="searchMode" value="single" checked={!multipleSearch} onChange={() => onChange(false)} />
      single card
    </label>
    <label>
      <input type="radio" name="searchMode" value="list" checked={multipleSearch} onChange={() => onChange(true)} />
      card list
    </label>
  </div>
);

/**
 * Fields to add a single card by name.
 */
const SingleCardFields = ({ onSearchModeChange }: { onSearchModeChange: SearchModeChangeHandler }) => (
  <>
    <input className="card-name-input" name="cardName" placeholder="e.g. Colossal Dreadmaw" />
    <input className="submit-card-search single" type="submit" value="Add card" />
    <SearchModeToggle multipleSearch={false} onChange={onSearchModeChange} />
  </>
);

/**
 * Fields to add a list of cards, one per line.
 */
const CardListFields = ({ onSearchModeChange }: { onSearchModeChange: SearchModeChangeHandler }) => {
  // Editing the card list clears the error about an invalid quantity
  const handleInput = useCallback((event: FormEvent<HTMLTextAreaElement>) => {
    event.currentTarget.setCustomValidity('');
  }, []);

  // Enter adds a new line in the card list, so Cmd/Ctrl+Enter submits it.
  // Intentionally undocumented in the UI: a shortcut for power users.
  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLTextAreaElement>) => {
    const isSubmitShortcut = event.key === 'Enter' && (event.metaKey || event.ctrlKey);
    if (!isSubmitShortcut || event.nativeEvent.isComposing) return;

    event.preventDefault();
    event.currentTarget.form?.requestSubmit();
  }, []);

  return (
    <>
      <textarea
        className="card-name-input"
        name="cardNamesList"
        placeholder="e.g. Colossal Dreadmaw"
        onKeyDown={handleKeyDown}
        onInput={handleInput}
      />
      {/* Invisible copy of the submit button that keeps the toggle centered */}
      <input
        className="submit-card-search multiple ghost"
        type="button"
        value="Add cards"
        tabIndex={-1}
        aria-hidden="true"
      />
      <SearchModeToggle multipleSearch onChange={onSearchModeChange} />
      <input className="submit-card-search multiple" type="submit" value="Add cards" />
    </>
  );
};

/**
 * Search form to add cards by name, either one at a time or as a list.
 *
 * @param props.onAddCards - Called with the card names to add, in order
 */
const CardSearchForm = ({ onAddCards }: { onAddCards: (cardNames: string[]) => void }) => {
  const [multipleSearch, setMultipleSearch] = useState(false);

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const form = event.currentTarget;
      const formData = new FormData(form);
      const getField = (name: string) => form.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement;
      const getValue = (name: string) => String(formData.get(name) ?? '');
      let cardNames;

      if (multipleSearch) {
        const cardList = getField('cardNamesList');
        const entries = parseCardList(getValue('cardNamesList'));
        const invalidEntry = entries.find(({ quantity }) => quantity < 1);

        if (invalidEntry) {
          cardList.setCustomValidity(`"${invalidEntry.line}": the quantity must be between 1 and ${MAX_QUANTITY}`);
          cardList.reportValidity();
          return;
        }

        cardNames = entries.flatMap(({ cardName, quantity }) => repeatCardName(cardName, quantity));
      } else {
        cardNames = [getValue('cardName').trim()].filter(Boolean);
      }

      if (cardNames.length > 0) onAddCards(cardNames);

      // The input starts over after adding the cards, so it's ready for the next ones
      getField(multipleSearch ? 'cardNamesList' : 'cardName').value = '';
    },
    [multipleSearch, onAddCards],
  );

  const handleSearchModeChange = useCallback((multiple: boolean) => {
    setMultipleSearch(multiple);
  }, []);

  return (
    <form className="card-search-form" action="#" onSubmit={handleSubmit}>
      {multipleSearch ? (
        <CardListFields onSearchModeChange={handleSearchModeChange} />
      ) : (
        <SingleCardFields onSearchModeChange={handleSearchModeChange} />
      )}
    </form>
  );
};

export default CardSearchForm;
