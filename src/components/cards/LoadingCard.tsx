import './LoadingCard.css';

/**
 * Placeholder shown in place of a card while its details are being fetched.
 */
const LoadingCard = () => {
  return (
    <div className="loading-card" role="status">
      <div className="loading-card-spinner" aria-hidden="true" />
      <span>Loading card details</span>
    </div>
  );
};

export default LoadingCard;
