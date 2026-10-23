import { useTranslation } from 'react-i18next';

// Bundled with the site, so pages don't load fonts from elsewhere
import '@fontsource/cinzel/700.css';
import './SiteHeader.css';

/**
 * Header of the site: its name, above the search form.
 */
const SiteHeader = () => {
  const { t } = useTranslation();

  return (
    <header className="site-header">
      <h1>{t('header.title')}</h1>
    </header>
  );
};

export default SiteHeader;
