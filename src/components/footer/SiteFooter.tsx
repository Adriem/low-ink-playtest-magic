import { useTranslation } from 'react-i18next';

import './SiteFooter.css';

const COPYRIGHT_HOLDER = 'Adrian Moreno';
/** Where users report issues: a new issue of the project on GitHub */
const NEW_ISSUE_URL = 'https://github.com/Adriem/low-ink-mtg-press/issues/new';

/**
 * Footer of the site: who owns what (Wizards of the Coast the cards, and the
 * rest is the site's own), and where to report issues.
 */
const SiteFooter = () => {
  const { t } = useTranslation();

  return (
    <footer className="site-footer">
      <p className="site-footer-disclaimer">{t('footer.disclaimer')}</p>
      <p>{t('footer.copyright', { year: new Date().getFullYear(), holder: COPYRIGHT_HOLDER })}</p>
      <p>
        {t('footer.found_issues')}{' '}
        <a href={NEW_ISSUE_URL} target="_blank" rel="noreferrer">
          {t('footer.report_here')}
        </a>
      </p>
    </footer>
  );
};

export default SiteFooter;
