import { useEffect, useRef } from 'react';

import './SheetSlotOverlay.css';

/**
 * Button of the overlay. Hidden buttons (of closed overlays) are out of the
 * tab order.
 *
 * @param {object} props
 * @param {boolean} props.hidden
 */
const OverlayButton = ({ hidden, children, ...buttonProps }) => (
  <button type="button" tabIndex={hidden ? -1 : 0} {...buttonProps}>
    {children}
  </button>
);

const MoveSubmenuButton = ({ hidden, onClick }) => (
  <OverlayButton className="sheet-slot-overlay-start-move" hidden={hidden} onClick={onClick}>
    <i className="fa fa-arrows-alt-h" /> Move...
  </OverlayButton>
);

const MoveButtons = ({ hidden, canMoveUp, canMoveDown, onMoveUp, onMoveDown }) => (
  <>
    {canMoveUp && (
      <OverlayButton className="sheet-slot-overlay-move-up" hidden={hidden} onClick={onMoveUp}>
        <i className="fa fa-arrow-left" /> Move up
      </OverlayButton>
    )}
    {canMoveDown && (
      <OverlayButton className="sheet-slot-overlay-move-down" hidden={hidden} onClick={onMoveDown}>
        <i className="fa fa-arrow-right" /> Move down
      </OverlayButton>
    )}
  </>
);

/**
 * In the menu, shows the danger state while pressed; in the hover overlay,
 * while hovered.
 */
const DeleteButton = ({ hidden, mode, onClick, onDangerChange }) => {
  const dangerHandlers = mode === 'menu'
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
    <OverlayButton className="sheet-slot-overlay-delete" hidden={hidden} onClick={onClick} {...dangerHandlers}>
      <i className="fa fa-trash" /> Delete
    </OverlayButton>
  );
};

const DismissButton = ({ hidden, onClick }) => (
  <OverlayButton className="sheet-slot-overlay-dismiss" hidden={hidden} onClick={onClick}>
    Dismiss
  </OverlayButton>
);

const CloseButton = ({ hidden, onClick }) => (
  <OverlayButton className="sheet-slot-overlay-close" hidden={hidden} onClick={onClick}>
    Close
  </OverlayButton>
);

/**
 * Controls of the overlay, depending on its mode:
 * - `hover` (mouse or pen): "Move..." and "Delete"
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
  onDismiss,
  onDangerChange,
}) => {
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
        <DeleteButton hidden={hidden} mode={mode} onClick={onDelete} onDangerChange={onDangerChange} />
      </>
    );
  }
};

/**
 * Overlay shown over a card in a sheet, with the actions for that card.
 *
 * All faces of a card shown separately get an overlay, so they open and change
 * color together, but only the main face shows the controls.
 *
 * @param {object} props
 * @param {'single'|'main'|'secondary'} props.face - Which face of the card this slot shows
 * @param {boolean} props.open - Whether the overlay is visible
 * @param {'hover'|'move-submenu'|'menu'} props.mode
 * @param {boolean} props.danger - Whether to show the destructive (red) state
 * @param {'first'|'move-up'|'move-down'|null} props.focus - Control to focus when requested
 * @param {number} props.focusRequestId - Changes on every focus request
 * @param {boolean} props.canMoveUp - Whether to show the "Move up" button
 * @param {boolean} props.canMoveDown - Whether to show the "Move down" button
 * @param {function(): void} props.onStartMove
 * @param {function(event: MouseEvent): void} props.onMoveUp
 * @param {function(event: MouseEvent): void} props.onMoveDown
 * @param {function(): void} props.onDelete
 * @param {function(event: MouseEvent): void} props.onDismiss - "Dismiss" in the menu and "Close" in the move submenu
 * @param {function(danger: boolean): void} props.onDangerChange
 */
const SheetSlotOverlay = ({
  face,
  open,
  mode,
  danger,
  focus,
  focusRequestId,
  ...controlProps
}) => {
  const controlsRef = useRef(null);

  // Keep a ref to the last render mode so that, while fading out from any mode,
  // we keep displaying the controls the overlay had while open instead of
  // switching to the hover controls mid-fade.
  const renderMode = useRef(mode);
  if (open) renderMode.current = mode;

  useEffect(() => {
    if (!open || !focus || !controlsRef.current) return;

    const control = controlsRef.current.querySelector(`.sheet-slot-overlay-${focus}`)
      ?? controlsRef.current.querySelector('button');
    control?.focus();
  }, [open, focus, focusRequestId]);

  const overlayClassName = [
    'sheet-slot-overlay',
    face === "main" ? "main-face" : face === "secondary" ? "secondary-face" : '',
    open ? 'open' : '',
    danger ? 'danger' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={overlayClassName}>
      {face !== 'secondary' && (
        <div className="sheet-slot-overlay-controls" ref={controlsRef}>
          <OverlayControls mode={renderMode.current} hidden={!open} {...controlProps} />
        </div>
      )}
    </div>
  );
};

export default SheetSlotOverlay;
