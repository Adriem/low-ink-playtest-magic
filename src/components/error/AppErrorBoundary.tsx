import { Component, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { clearSavedData } from '../../utils/storage';

import './AppErrorBoundary.css';

/**
 * Shows a way back instead of a blank page when the app breaks while
 * rendering, e.g. on saved data it can't read: reloading it, or resetting
 * the data it saved.
 */
class AppErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    return this.state.hasError ? <AppError /> : this.props.children;
  }
}

const AppError = () => {
  const { t } = useTranslation();

  const handleReloadClick = () => {
    window.location.reload();
  };

  const handleResetClick = () => {
    clearSavedData();
    window.location.reload();
  };

  return (
    <main className="app-error container" role="alert">
      <h1>{t('app_error.title')}</h1>
      <p>{t('app_error.description')}</p>
      <div className="app-error-actions">
        <button type="button" onClick={handleReloadClick}>
          {t('app_error.reload')}
        </button>
        <button type="button" onClick={handleResetClick}>
          {t('app_error.reset')}
        </button>
      </div>
    </main>
  );
};

export default AppErrorBoundary;
