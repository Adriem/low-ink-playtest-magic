import { useTranslation } from 'react-i18next';

import './LoadingCard.css';

/**
 * Placeholder shown in place of a card while its details are being fetched.
 */
const LoadingCard = () => {
  const { t } = useTranslation();

  return (
    <div className="loading-card" role="status">
      <div className="loading-card-spinner" aria-hidden="true" />
      <span>{t('loading_card')}</span>
    </div>
  );
};

export default LoadingCard;
