import { useCallback, useState } from 'react';

import './CardSearchForm.css';

/**
 * Turn the content of the card list textarea into card names: one card per
 * line, ignoring empty lines and leading quantities (e.g. "4 Lightning Bolt").
 *
 * @param {string} cardList
 * @returns {string[]}
 */
const parseCardList = (cardList) => cardList
  .replace(/^\d+\s/gm, '')
  .split('\n')
  .map(cardName => cardName.trim())
  .filter(Boolean);

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

    const formData = new FormData(event.target);
    const cardNames = multipleSearch
      ? parseCardList(formData.get('cardNamesList'))
      : [formData.get('cardName').trim()].filter(Boolean);

    if (cardNames.length > 0) onAddCards(cardNames);
  }, [multipleSearch, onAddCards]);

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
