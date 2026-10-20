import type { MouseEvent, ReactNode, Ref } from 'react';

import './Popup.css';

/**
 * Modal popup, opened with `showModal()` on the dialog in `ref`. Clicking the
 * overlay around it closes it, as does Escape. Buttons in a `<menu>` go at its
 * bottom right.
 */
const Popup = ({
  ref,
  className,
  children,
}: {
  ref?: Ref<HTMLDialogElement>;
  className?: string;
  children: ReactNode;
}) => {
  // Clicks on the overlay around the dialog target the dialog itself, outside its box
  const handleClick = (event: MouseEvent<HTMLDialogElement>) => {
    const dialog = event.currentTarget;
    if (event.target !== dialog) return;

    const { left, right, top, bottom } = dialog.getBoundingClientRect();
    const isInside = event.clientX >= left && event.clientX <= right && event.clientY >= top && event.clientY <= bottom;
    if (!isInside) dialog.close();
  };

  return (
    // Clicking the overlay is a shortcut: the keyboard closes the dialog with Escape, natively
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
    <dialog ref={ref} className={className ? `popup ${className}` : 'popup'} onClick={handleClick}>
      {children}
    </dialog>
  );
};

export default Popup;
