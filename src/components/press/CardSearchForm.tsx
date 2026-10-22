import { useCallback, useState, type FormEvent, type KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { MAX_QUANTITY, parseCardList } from '../../domain/cardList';

import './CardSearchForm.css';

type SearchModeChangeHandler = (multipleSearch: boolean) => void;

/**
 * Search form to add cards by name, either one at a time or as a list.
 *
 * @param props.onAddCard - Called with the name of a card added on its own
 * @param props.onAddCards - Called with the names of the cards of a list, in order
 */
const CardSearchForm = ({
  onAddCard,
  onAddCards,
}: {
  onAddCard: (cardName: string) => void;
  onAddCards: (cardNames: string[]) => void;
}) => {
  const { t } = useTranslation();
  const [multipleSearch, setMultipleSearch] = useState(false);

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const form = event.currentTarget;
      const formData = new FormData(form);
      const getField = (name: string) => {
        return form.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement;
      };
      const getValue = (name: string) => {
        return String(formData.get(name) ?? '');
      };

      if (multipleSearch) {
        const cardList = getField('cardNamesList');
        const entries = parseCardList(getValue('cardNamesList'));
        const invalidEntry = entries.find(({ quantity }) => quantity < 1);

        if (invalidEntry) {
          cardList.setCustomValidity(t('search_form.invalid_quantity', { line: invalidEntry.line, max: MAX_QUANTITY }));
          cardList.reportValidity();
          return;
        }

        const cardNames = entries.flatMap(({ cardName, quantity }) => repeatCardName(cardName, quantity));
        if (cardNames.length > 0) onAddCards(cardNames);
      } else {
        const cardName = getValue('cardName').trim();
        if (cardName) onAddCard(cardName);
      }

      // The input starts over after adding the cards, so it's ready for the next ones
      getField(multipleSearch ? 'cardNamesList' : 'cardName').value = '';
    },
    [multipleSearch, onAddCard, onAddCards, t],
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

const repeatCardName = (cardName: string, quantity: number) => {
  return Array.from({ length: quantity }, () => cardName);
};

/**
 * Fields to add a single card by name.
 */
const SingleCardFields = ({ onSearchModeChange }: { onSearchModeChange: SearchModeChangeHandler }) => {
  const { t } = useTranslation();

  return (
    <>
      <input className="card-name-input" name="cardName" placeholder={t('search_form.placeholder')} />
      <input className="submit-card-search single" type="submit" value={t('search_form.add')} />
      <SearchModeToggle multipleSearch={false} onChange={onSearchModeChange} />
    </>
  );
};

/**
 * Fields to add a list of cards, one per line.
 */
const CardListFields = ({ onSearchModeChange }: { onSearchModeChange: SearchModeChangeHandler }) => {
  const { t } = useTranslation();

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
        rows={4}
        placeholder={t('search_form.placeholder')}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
      />
      <input className="submit-card-search multiple" type="submit" value={t('search_form.add_cards')} />
      <SearchModeToggle multipleSearch onChange={onSearchModeChange} />
    </>
  );
};

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
}) => {
  const { t } = useTranslation();

  return (
    <div className="search-mode" role="radiogroup" aria-labelledby="search-mode-label">
      <span id="search-mode-label">{t('search_form.search_mode')}</span>
      <label>
        <input
          type="radio"
          name="searchMode"
          value="single"
          checked={!multipleSearch}
          onChange={() => onChange(false)}
        />
        {t('search_form.single_card')}
      </label>
      <label>
        <input type="radio" name="searchMode" value="list" checked={multipleSearch} onChange={() => onChange(true)} />
        {t('search_form.card_list')}
      </label>
    </div>
  );
};

export default CardSearchForm;
