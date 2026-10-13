import { useEffect, useRef } from 'react';

import './SheetSlotOverlay.css';

const FACE_CLASS_NAMES = {
  single: '',
  main: 'main-face',
  secondary: 'secondary-face',
};

/**
 * Overlay shown over a card in a sheet, with the actions for that card.
 *
 * All faces of a card shown separately get an overlay, so they open and change
 * color together, but only the main face shows the controls.
 *
 * - `hover` mode (mouse or pen): "Move..." and "Delete". "Move..." enters the
 *   move state, with the move buttons and "Close".
 * - `menu` mode (tap or keyboard): all the actions at once, plus "Dismiss".
 *
 * @param {object} props
 * @param {'single'|'main'|'secondary'} props.face - Which face of the card this slot shows
 * @param {boolean} props.open - Whether the overlay is visible
 * @param {'hover'|'menu'} props.mode
 * @param {boolean} props.danger - Whether to show the destructive (red) state
 * @param {boolean} props.isMoving - Whether the hover overlay is in the move state
 * @param {'first'|'move-up'|'move-down'|null} props.focus - Control to focus when requested
 * @param {number} props.focusRequestId - Changes on every focus request
 * @param {boolean} props.canMoveUp - Whether to show the "Move up" button
 * @param {boolean} props.canMoveDown - Whether to show the "Move down" button
 * @param {function(): void} props.onStartMove
 * @param {function(event: MouseEvent): void} props.onMoveUp
 * @param {function(event: MouseEvent): void} props.onMoveDown
 * @param {function(): void} props.onDelete
 * @param {function(event: MouseEvent): void} props.onDismiss - "Dismiss" in the menu and "Close" in the move state
 * @param {function(danger: boolean): void} props.onDangerChange
 */
const SheetSlotOverlay = ({
  face,
  open,
  mode,
  danger,
  isMoving,
  focus,
  focusRequestId,
  canMoveUp,
  canMoveDown,
  onStartMove,
  onMoveUp,
  onMoveDown,
  onDelete,
  onDismiss,
  onDangerChange,
}) => {
  const controlsRef = useRef(null);

  // While fading out, keep showing the controls the overlay had while open,
  // instead of switching to the hover controls mid-fade
  const lastOpenStateRef = useRef({ mode, isMoving });
  if (open) lastOpenStateRef.current = { mode, isMoving };
  const shown = open ? { mode, isMoving } : lastOpenStateRef.current;

  useEffect(() => {
    if (!open || !focus || !controlsRef.current) return;

    const control = controlsRef.current.querySelector(`.sheet-slot-overlay-${focus}`)
      ?? controlsRef.current.querySelector('button');
    control?.focus();
  }, [open, focus, focusRequestId]);

  const className = [
    'sheet-slot-overlay',
    FACE_CLASS_NAMES[face],
    open ? 'open' : '',
    danger ? 'danger' : '',
  ].filter(Boolean).join(' ');

  // The menu shows the danger state while "Delete" is pressed, the hover
  // overlay while it's hovered
  const dangerHandlers = shown.mode === 'menu'
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

  // Controls of closed overlays are out of the tab order
  const tabIndex = open ? 0 : -1;

  const moveButtons = (
    <>
      {canMoveUp && (
        <button type="button" className="sheet-slot-overlay-move-up" tabIndex={tabIndex} onClick={onMoveUp}>
          <i className="fa fa-arrow-left" /> Move up
        </button>
      )}
      {canMoveDown && (
        <button type="button" className="sheet-slot-overlay-move-down" tabIndex={tabIndex} onClick={onMoveDown}>
          <i className="fa fa-arrow-right" /> Move down
        </button>
      )}
    </>
  );

  const deleteButton = (
    <button
      type="button"
      className="sheet-slot-overlay-delete"
      tabIndex={tabIndex}
      onClick={onDelete}
      {...dangerHandlers}
    >
      <i className="fa fa-trash" /> Delete
    </button>
  );

  const renderControls = () => {
    if (shown.mode === 'menu') {
      return (
        <>
          {moveButtons}
          {deleteButton}
          <hr className="sheet-slot-overlay-separator" />
          <button type="button" className="sheet-slot-overlay-dismiss" tabIndex={tabIndex} onClick={onDismiss}>
            Dismiss
          </button>
        </>
      );
    }

    if (shown.isMoving) {
      return (
        <>
          {moveButtons}
          <hr className="sheet-slot-overlay-separator" />
          <button type="button" className="sheet-slot-overlay-dismiss" tabIndex={tabIndex} onClick={onDismiss}>
            Close
          </button>
        </>
      );
    }

    return (
      <>
        {(canMoveUp || canMoveDown) && (
          <button type="button" className="sheet-slot-overlay-start-move" tabIndex={tabIndex} onClick={onStartMove}>
            <i className="fa fa-arrows-alt-h" /> Move...
          </button>
        )}
        {deleteButton}
      </>
    );
  };

  return (
    <div className={className}>
      {face !== 'secondary' && (
        <div className="sheet-slot-overlay-controls" ref={controlsRef}>
          {renderControls()}
        </div>
      )}
    </div>
  );
};

export default SheetSlotOverlay;
