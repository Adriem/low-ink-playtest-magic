import { useTranslation } from 'react-i18next';

import './CardLoadErrors.css';

/**
 * Notice of the cards that couldn't be added, e.g. misspelled ones in a card
 * list, all at once and without blocking the rest of the press.
 *
 * @param props.cardNames - Names of the cards, as they were asked for
 * @param props.onDismiss - Called when the notice is closed
 */
const CardLoadErrors = ({ cardNames, onDismiss }: { cardNames: string[]; onDismiss: () => void }) => {
  const { t } = useTranslation();

  return (
    <div className="card-load-errors" role="alert">
      <button
        type="button"
        className="card-load-errors-dismiss"
        aria-label={t('card_load_errors.dismiss')}
        onClick={onDismiss}
      >
        ×
      </button>
      <p>{t('card_load_errors.message', { count: cardNames.length })}</p>
      <ul>
        {cardNames.map((cardName) => (
          <li key={cardName}>{cardName}</li>
        ))}
      </ul>
    </div>
  );
};

export default CardLoadErrors;
