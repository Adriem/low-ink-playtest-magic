import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';

import './Icon.css';

/**
 * An icon of Font Awesome Free (https://fontawesome.com, CC BY 4.0), drawn as
 * an inline SVG as tall as the text and in its color. Icons are imported one
 * by one (e.g. `faTrash`), so only the ones used are bundled. It's decorative:
 * the text next to it says what it means.
 */
const Icon = ({ icon }: { icon: IconDefinition }) => {
  const [width, height, , , path] = icon.icon;

  return (
    <svg className="icon" viewBox={`0 0 ${width} ${height}`} aria-hidden="true" focusable="false">
      <path fill="currentColor" d={Array.isArray(path) ? path.join(' ') : path} />
    </svg>
  );
};

export default Icon;
