import type { ReactNode } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import './SiteFooter.css';

const COPYRIGHT_HOLDER = 'Adrian Moreno';
/** Where users report issues: a new issue of the project on GitHub */
const NEW_ISSUE_URL = 'https://github.com/Adriem/low-ink-mtg-press/issues/new';
/** The site's source code, which the AGPL asks sites running it to offer to their users */
const SOURCE_CODE_URL = 'https://github.com/Adriem/low-ink-mtg-press';
const LICENSE_URL = 'https://www.gnu.org/licenses/agpl-3.0.html';

/**
 * Footer of the site: who owns what (Wizards of the Coast the cards, and the
 * rest is the site's own, its code free software under the AGPL), where its
 * source code is, and where to report issues.
 */
const SiteFooter = () => {
  const { t } = useTranslation();

  return (
    <footer className="site-footer">
      <p className="site-footer-disclaimer">{t('footer.disclaimer')}</p>
      <p>{t('footer.copyright', { year: new Date().getFullYear(), holder: COPYRIGHT_HOLDER })}</p>
      <p>
        <Trans
          i18nKey="footer.license"
          components={{ license: <ExternalLink href={LICENSE_URL} />, repo: <ExternalLink href={SOURCE_CODE_URL} /> }}
        />
      </p>
      <p>
        {t('footer.found_issues')} <ExternalLink href={NEW_ISSUE_URL}>{t('footer.report_here')}</ExternalLink>
      </p>
    </footer>
  );
};

/**
 * Link to another site, in a new tab. Its text can also come from a translated
 * text (with `Trans`), which fills it in.
 */
const ExternalLink = ({ href, children }: { href: string; children?: ReactNode }) => {
  return (
    <a href={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  );
};

export default SiteFooter;
