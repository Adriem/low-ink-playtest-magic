import type { ComponentProps, MouseEvent, SyntheticEvent } from 'react';
import { useTranslation } from 'react-i18next';

import './Popup.css';

/**
 * Modal popup, opened with `showModal()` on the dialog in `ref`. Clicking the
 * overlay around it closes it, as does Escape, or its close button, when it
 * has one, unless it's not dismissible. It can also have a back button, e.g.
 * to leave a view inside it. Buttons in a `<menu>` go at its bottom right.
 * Other props go to the `<dialog>`.
 */
const Popup = ({
  className,
  dismissible = true,
  hasCloseButton = false,
  onBack,
  onClick,
  onCancel,
  children,
  ...dialogProps
}: ComponentProps<'dialog'> & {
  /** Whether clicking around it or Escape close it, e.g. not until a choice is made */
  dismissible?: boolean;
  /** Whether it has a close button, at its top right corner */
  hasCloseButton?: boolean;
  /** Called with its back button, at its top left corner, which it only has with this */
  onBack?: () => void;
}) => {
  const { t } = useTranslation();
  // Clicks on the overlay around the dialog target the dialog itself, outside its box
  const handleClick = (event: MouseEvent<HTMLDialogElement>) => {
    onClick?.(event);
    const dialog = event.currentTarget;
    if (!dismissible || event.target !== dialog) return;

    const { left, right, top, bottom } = dialog.getBoundingClientRect();
    const isInside = event.clientX >= left && event.clientX <= right && event.clientY >= top && event.clientY <= bottom;
    if (!isInside) dialog.close();
  };

  // Escape cancels the dialog, which closes it unless prevented
  const handleCancel = (event: SyntheticEvent<HTMLDialogElement>) => {
    onCancel?.(event);
    if (!dismissible) event.preventDefault();
  };

  const handleCloseClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.currentTarget.closest('dialog')?.close();
  };

  return (
    // Clicking the overlay is a shortcut: the keyboard closes the dialog with Escape, natively
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
    <dialog
      {...dialogProps}
      className={className ? `popup ${className}` : 'popup'}
      onClick={handleClick}
      onCancel={handleCancel}
    >
      {(onBack || hasCloseButton) && (
        <div className="popup-controls">
          {onBack && (
            <button type="button" className="link-button" onClick={onBack}>
              {t('popup.back')}
            </button>
          )}
          {hasCloseButton && (
            <button type="button" className="popup-close" aria-label={t('popup.close')} onClick={handleCloseClick}>
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
