import { useCallback, useState } from 'react';

import './CardSearchForm.css';

const MAX_QUANTITY = 100;
// e.g. "4 Lightning Bolt", "2x Counterspell", "1X Colossal Dreadmaw"
const QUANTITY_PREFIX_REGEX = /^(\d+)\s*[xX]?\s+(.+)$/;

/**
 * @typedef {object} CardListEntry
 * @prop {string} line - Line of the card list it was parsed from
 * @prop {string} cardName
 * @prop {number} quantity
 */

/**
 * Parse a line of the card list: an optional quantity followed by the card
 * name. Numbers too big to be a quantity are part of the name (e.g. "1996
 * World Champion"), so such cards need an explicit quantity ("1 1996 World
 * Champion").
 *
 * @param {string} line
 * @returns {CardListEntry}
 */
const parseCardListLine = (line) => {
  const match = line.match(QUANTITY_PREFIX_REGEX);
  const quantity = match ? Number(match[1]) : 1;

  if (!match || quantity > MAX_QUANTITY) return { line, cardName: line, quantity: 1 };
  return { line, cardName: match[2].trim(), quantity };
};

/**
 * Turn the content of the card list textarea into entries: one card per line,
 * ignoring empty lines.
 *
 * @param {string} cardList
 * @returns {CardListEntry[]}
 */
const parseCardList = (cardList) => cardList
  .split('\n')
  .map(line => line.trim())
  .filter(Boolean)
  .map(parseCardListLine);

const repeatCardName = (cardName, quantity) => Array.from({ length: quantity }, () => cardName);

/**
 * Search form to add cards by name, either one at a time or as a list.
 *
 * @param {object} props
 * @param {function(cardNames: string[]): void} props.onAddCards - Called with
 *   the card names to add, in order
 */
const CardSearchForm = ({ onAddCards }) => {
  const [multipleSearch, setMultipleSearch] = useState(false);

  const handleSubmit = useCallback((event) => {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);
    let cardNames;

    if (multipleSearch) {
      const cardList = form.elements.namedItem('cardNamesList');
      const entries = parseCardList(formData.get('cardNamesList'));
      const invalidEntry = entries.find(({ quantity }) => quantity < 1);

      if (invalidEntry) {
        cardList.setCustomValidity(`"${invalidEntry.line}": the quantity must be between 1 and ${MAX_QUANTITY}`);
        cardList.reportValidity();
        return;
      }

      cardNames = entries.flatMap(({ cardName, quantity }) => repeatCardName(cardName, quantity));
    } else {
      cardNames = [formData.get('cardName').trim()].filter(Boolean);
    }

    if (cardNames.length > 0) onAddCards(cardNames);

    // The input starts over after adding the cards, so it's ready for the next ones
    form.elements.namedItem(multipleSearch ? 'cardNamesList' : 'cardName').value = '';
  }, [multipleSearch, onAddCards]);

  // Editing the card list clears the error about an invalid quantity
  const handleCardListInput = useCallback((event) => {
    event.currentTarget.setCustomValidity('');
  }, []);

  // Enter adds a new line in the card list, so Cmd/Ctrl+Enter submits it.
  // Intentionally undocumented in the UI: a shortcut for power users.
  const handleCardListKeyDown = useCallback((event) => {
    const isSubmitShortcut = event.key === 'Enter' && (event.metaKey || event.ctrlKey);
    if (!isSubmitShortcut || event.nativeEvent.isComposing) return;

    event.preventDefault();
    event.currentTarget.form.requestSubmit();
  }, []);

  const searchModeToggle = (
    <div
      className={`search-mode ${multipleSearch ? 'list' : 'single'}`}
      role="radiogroup"
      aria-labelledby="search-mode-label"
    >
      <span id="search-mode-label">Search mode:</span>
      <label>
        <input
          type="radio"
          name="searchMode"
          value="single"
          checked={!multipleSearch}
          onChange={() => setMultipleSearch(false)}
        />
        single card
      </label>
      <label>
        <input
          type="radio"
          name="searchMode"
          value="list"
          checked={multipleSearch}
          onChange={() => setMultipleSearch(true)}
        />
        card list
      </label>
    </div>
  );

  return (
    <form className="card-search-form" action="#" onSubmit={handleSubmit}>
      {multipleSearch ? (
        <>
          <textarea
            className="card-name-input"
            name="cardNamesList"
            placeholder="e.g. Colossal Dreadmaw"
            onKeyDown={handleCardListKeyDown}
            onInput={handleCardListInput}
          />
          {/* Invisible copy of the submit button that keeps the toggle centered */}
          <input
            className="submit-card-search multiple ghost"
            type="button"
            value="Add cards"
            tabIndex={-1}
            aria-hidden="true"
          />
          {searchModeToggle}
          <input
            className="submit-card-search multiple"
            type="submit"
            value="Add cards"
          />
        </>
      ) : (
        <>
          <input
            className="card-name-input"
            name="cardName"
            placeholder="e.g. Colossal Dreadmaw"
          />
          <input
            className="submit-card-search single"
            type="submit"
            value="Add card"
          />
          {searchModeToggle}
        </>
      )}
    </form>
  );
};

export default CardSearchForm;
