import { useEffect, useState, type RefObject } from 'react';

import './BackToTopButton.css';

/**
 * Floating button that scrolls back to the top of the page, shown while an
 * element (e.g. the search form) is scrolled out of view.
 *
 * @param props.watched - Element the button is shown without
 */
const BackToTopButton = ({ watched }: { watched: RefObject<Element | null> }) => {
  const [isWatchedVisible, setIsWatchedVisible] = useState(true);

  useEffect(() => {
    const element = watched.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => setIsWatchedVisible(entry.isIntersecting));
    observer.observe(element);
    return () => observer.disconnect();
  }, [watched]);

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isWatchedVisible) return null;

  return (
    <button type="button" className="back-to-top big-button" onClick={handleClick}>
      Back to top
    </button>
  );
};

export default BackToTopButton;
