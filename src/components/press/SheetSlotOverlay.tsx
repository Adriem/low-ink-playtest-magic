import { useEffect, useRef, useState, type ButtonHTMLAttributes, type MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { faArrowLeft, faArrowRight, faArrowsLeftRight, faImage, faTrash } from '@fortawesome/free-solid-svg-icons';
import Icon from '../icons/Icon';
import type { OverlayFocus, OverlayMode } from './CardOverlayContext';
import type { SheetFace } from '../../domain/press';

import './SheetSlotOverlay.css';

type ClickHandler = (event: MouseEvent) => void;

interface MoveButtonsProps {
  hidden: boolean;
  /** Whether to show the "Move up" button */
  canMoveUp: boolean;
  /** Whether to show the "Move down" button */
  canMoveDown: boolean;
  onMoveUp: ClickHandler;
  onMoveDown: ClickHandler;
}

interface OverlayControlsProps extends MoveButtonsProps {
  mode: OverlayMode;
  onStartMove: () => void;
  onDelete: ClickHandler;
  /** Shows the "Edit art" button, where cards are drawn with art */
  onOverrideArt?: () => void;
  /** "Dismiss" in the menu and "Close" in the move submenu */
  onDismiss: ClickHandler;
  onDangerChange: (danger: boolean) => void;
}

/**
 * Overlay shown over a card in a sheet, with the actions for that card.
 *
 * All faces of a card shown separately get an overlay, so they open and change
 * color together, but only the main face shows the controls.
 *
 * @param props.face - Which face of the card this slot shows
 * @param props.open - Whether the overlay is visible
 * @param props.danger - Whether to show the destructive (red) state
 * @param props.focus - Control to focus when requested
 * @param props.focusRequestId - Changes on every focus request
 */
const SheetSlotOverlay = ({
  face,
  open,
  mode,
  danger,
  focus,
  focusRequestId,
  ...controlProps
}: Omit<OverlayControlsProps, 'hidden'> & {
  face: SheetFace;
  open: boolean;
  danger: boolean;
  focus: OverlayFocus | null;
  focusRequestId: number;
}) => {
  const controlsRef = useRef<HTMLDivElement>(null);

  // Keep the last mode the overlay had while open so that, while fading out
  // from any mode, we keep displaying its controls instead of switching to the
  // hover controls mid-fade.
  const [renderMode, setRenderMode] = useState(mode);
  if (open && mode !== renderMode) setRenderMode(mode);

  useEffect(() => {
    if (!open || !focus || !controlsRef.current) return;

    const control =
      controlsRef.current.querySelector<HTMLElement>(`.sheet-slot-overlay-${focus}`) ??
      controlsRef.current.querySelector('button');
    control?.focus();
  }, [open, focus, focusRequestId]);

  const overlayClassName = [
    'sheet-slot-overlay',
    face === 'main' ? 'main-face' : face === 'secondary' ? 'secondary-face' : '',
    open ? 'open' : '',
    danger ? 'danger' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={overlayClassName}>
      {face !== 'secondary' && (
        <div className="sheet-slot-overlay-controls" ref={controlsRef}>
          <OverlayControls mode={renderMode} hidden={!open} {...controlProps} />
        </div>
      )}
    </div>
  );
};

/**
 * Controls of the overlay, depending on its mode:
 * - `hover` (mouse or pen): "Move...", "Edit art" and "Delete"
 * - `move-submenu` (after "Move..."): the move buttons and "Close"
 * - `menu` (tap or keyboard): all the actions at once, plus "Dismiss"
 */
const OverlayControls = ({
  mode,
  hidden,
  canMoveUp,
  canMoveDown,
  onStartMove,
  onMoveUp,
  onMoveDown,
  onDelete,
  onOverrideArt,
  onDismiss,
  onDangerChange,
}: OverlayControlsProps) => {
  switch (mode) {
    case 'menu':
      return (
        <>
          <MoveButtons
            hidden={hidden}
            canMoveUp={canMoveUp}
            canMoveDown={canMoveDown}
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
          />
          {onOverrideArt && <EditArtButton hidden={hidden} onClick={onOverrideArt} />}
          <DeleteButton hidden={hidden} mode={mode} onClick={onDelete} onDangerChange={onDangerChange} />
          <hr className="sheet-slot-overlay-separator" />
          <DismissButton hidden={hidden} onClick={onDismiss} />
        </>
      );

    case 'move-submenu':
      return (
        <>
          <MoveButtons
            hidden={hidden}
            canMoveUp={canMoveUp}
            canMoveDown={canMoveDown}
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
          />
          <hr className="sheet-slot-overlay-separator" />
          <CloseButton hidden={hidden} onClick={onDismiss} />
        </>
      );

    default:
      return (
        <>
          {(canMoveUp || canMoveDown) && <MoveSubmenuButton hidden={hidden} onClick={onStartMove} />}
          {onOverrideArt && <EditArtButton hidden={hidden} onClick={onOverrideArt} />}
          <DeleteButton hidden={hidden} mode={mode} onClick={onDelete} onDangerChange={onDangerChange} />
        </>
      );
  }
};

const MoveSubmenuButton = ({ hidden, onClick }: { hidden: boolean; onClick: () => void }) => {
  const { t } = useTranslation();

  return (
    <OverlayButton className="sheet-slot-overlay-start-move" hidden={hidden} onClick={onClick}>
      <Icon icon={faArrowsLeftRight} /> {t('card_overlay.move')}
    </OverlayButton>
  );
};

const EditArtButton = ({ hidden, onClick }: { hidden: boolean; onClick: () => void }) => {
  const { t } = useTranslation();

  return (
    <OverlayButton className="sheet-slot-overlay-edit-art" hidden={hidden} onClick={onClick}>
      <Icon icon={faImage} /> {t('card_overlay.edit_art')}
    </OverlayButton>
  );
};

const MoveButtons = ({ hidden, canMoveUp, canMoveDown, onMoveUp, onMoveDown }: MoveButtonsProps) => {
  const { t } = useTranslation();

  return (
    <>
      {canMoveUp && (
        <OverlayButton className="sheet-slot-overlay-move-up" hidden={hidden} onClick={onMoveUp}>
          <Icon icon={faArrowLeft} /> {t('card_overlay.move_up')}
        </OverlayButton>
      )}
      {canMoveDown && (
        <OverlayButton className="sheet-slot-overlay-move-down" hidden={hidden} onClick={onMoveDown}>
          <Icon icon={faArrowRight} /> {t('card_overlay.move_down')}
        </OverlayButton>
      )}
    </>
  );
};

/**
 * In the menu, shows the danger state while pressed; in the hover overlay,
 * while hovered.
 */
const DeleteButton = ({
  hidden,
  mode,
  onClick,
  onDangerChange,
}: {
  hidden: boolean;
  mode: OverlayMode;
  onClick: ClickHandler;
  onDangerChange: (danger: boolean) => void;
}) => {
  const { t } = useTranslation();
  const dangerHandlers =
    mode === 'menu'
      ? {
          onPointerDown: () => onDangerChange(true),
          onPointerUp: () => onDangerChange(false),
          onPointerCancel: () => onDangerChange(false),
          onPointerLeave: () => onDangerChange(false),
        }
      : {
          onMouseEnter: () => onDangerChange(true),
          onMouseLeave: () => onDangerChange(false),
        };

  return (
    <OverlayButton className="danger sheet-slot-overlay-delete" hidden={hidden} onClick={onClick} {...dangerHandlers}>
      <Icon icon={faTrash} /> {t('card_overlay.delete')}
    </OverlayButton>
  );
};

const DismissButton = ({ hidden, onClick }: { hidden: boolean; onClick: ClickHandler }) => {
  const { t } = useTranslation();

  return (
    <OverlayButton className="sheet-slot-overlay-dismiss" hidden={hidden} onClick={onClick}>
      {t('card_overlay.dismiss')}
    </OverlayButton>
  );
};

const CloseButton = ({ hidden, onClick }: { hidden: boolean; onClick: ClickHandler }) => {
  const { t } = useTranslation();

  return (
    <OverlayButton className="sheet-slot-overlay-close" hidden={hidden} onClick={onClick}>
      {t('card_overlay.close')}
    </OverlayButton>
  );
};

/**
 * Button of the overlay. Hidden buttons (of closed overlays) are out of the tab
 * order.
 */
const OverlayButton = ({
  hidden,
  className,
  children,
  ...buttonProps
}: ButtonHTMLAttributes<HTMLButtonElement> & { hidden: boolean }) => {
  return (
    <button type="button" className={className} tabIndex={hidden ? -1 : 0} {...buttonProps}>
      {children}
    </button>
  );
};

export default SheetSlotOverlay;
