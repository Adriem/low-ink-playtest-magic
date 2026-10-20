import type { MouseEvent, ReactNode, Ref } from 'react';

import './Popup.css';

/**
 * Modal popup, opened with `showModal()` on the dialog in `ref`. Clicking the
 * overlay around it closes it, as does Escape, or its close button, when it
 * has one. It can also have a back button, e.g. to leave a view inside it.
 * Buttons in a `<menu>` go at its bottom right.
 */
const Popup = ({
  ref,
  className,
  hasCloseButton = false,
  onBack,
  onClose,
  children,
}: {
  ref?: Ref<HTMLDialogElement>;
  className?: string;
  /** Whether it has a close button, at its top right corner */
  hasCloseButton?: boolean;
  /** Called with its back button, at its top left corner, which it only has with this */
  onBack?: () => void;
  /** Called when the popup closes, in any way */
  onClose?: () => void;
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

  const handleCloseClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.currentTarget.closest('dialog')?.close();
  };

  return (
    // Clicking the overlay is a shortcut: the keyboard closes the dialog with Escape, natively
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
    <dialog ref={ref} className={className ? `popup ${className}` : 'popup'} onClick={handleClick} onClose={onClose}>
      {(onBack || hasCloseButton) && (
        <div className="popup-controls">
          {onBack && (
            <button type="button" className="link-button" onClick={onBack}>
              ← Back
            </button>
          )}
          {hasCloseButton && (
            <button type="button" className="popup-close" aria-label="Close" onClick={handleCloseClick}>
              ×
            </button>
          )}
        </div>
      )}
      {children}
    </dialog>
  );
};

export default Popup;
