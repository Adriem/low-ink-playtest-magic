import './SiteFooter.css';

const COPYRIGHT_HOLDER = 'Adrian Moreno';
/** Where users report issues: a new issue of the project on GitHub */
const NEW_ISSUE_URL = 'https://github.com/Adriem/low-ink-mtg-press/issues/new';

/**
 * Footer of the site: its copyright notice, and where to report issues.
 */
const SiteFooter = () => {
  return (
    <footer className="site-footer">
      <p>
        © {new Date().getFullYear()} {COPYRIGHT_HOLDER}
      </p>
      <p>
        Found any issues?{' '}
        <a href={NEW_ISSUE_URL} target="_blank" rel="noreferrer">
          Report here
        </a>
      </p>
    </footer>
  );
};

export default SiteFooter;
