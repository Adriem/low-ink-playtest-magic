import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * @typedef {object} OverlayState
 * @prop {number|null} collectionIndex - Collection card the overlay is open for
 * @prop {'hover'|'menu'} mode - `hover` while hovering with a mouse or pen;
 *   `menu` when opened by tapping or from the keyboard (sticky, with "Dismiss")
 * @prop {boolean} danger - Whether to show the destructive (red) state
 * @prop {boolean} moving - Whether the hover overlay is in the move state (sticky)
 * @prop {'first'|'move-up'|'move-down'|null} focus - Control to focus after
 *   opening the menu or moving a card from the keyboard
 * @prop {number} focusRequestId - Changes on every focus request
 */

/** @type {OverlayState} */
const CLOSED_OVERLAY = {
  collectionIndex: null,
  mode: 'hover',
  danger: false,
  moving: false,
  focus: null,
  focusRequestId: 0,
};

const isSticky = (overlay) => overlay.mode === 'menu' || overlay.moving;

// Clicks triggered with Enter or Space have no click count
const isKeyboardClick = (event) => event?.detail === 0;

/**
 * Manage the overlay with the actions for the cards in the press. All the
 * slots of a collection card (e.g. both faces of a double-faced card) share it.
 *
 * How it opens depends on each interaction rather than on the device, so it
 * also works on devices with both a mouse and a touch screen:
 * - Hovering a card with a mouse or pen opens the hover overlay
 * - Tapping a card, or activating it from the keyboard, opens the menu, which
 *   stays open until dismissed or until clicking outside of it
 *
 * @param {object} options
 * @param {number} options.collectionSize - Number of cards in the collection
 * @param {function(fromIndex: number, toIndex: number): void} options.moveCard
 * @param {function(index: number): void} options.removeCardAt
 */
export const useCardOverlay = ({ collectionSize, moveCard, removeCardAt }) => {
  const [overlay, setOverlay] = useState(CLOSED_OVERLAY);
  const overlayRef = useRef(overlay);
  overlayRef.current = overlay;
  // Card under the mouse pointer, tracked even while the overlay is sticky
  const hoveredCollectionIndexRef = useRef(null);
  // Card buttons of the main face of each collection card, to return focus to them
  const cardButtonsRef = useRef(new Map());

  const openHover = useCallback((collectionIndex) => {
    setOverlay(current => (isSticky(current) || current.collectionIndex === collectionIndex)
      ? current
      : { ...CLOSED_OVERLAY, collectionIndex, focusRequestId: current.focusRequestId });
  }, []);

  const closeHover = useCallback((collectionIndex) => {
    setOverlay(current => (isSticky(current) || current.collectionIndex !== collectionIndex)
      ? current
      : { ...CLOSED_OVERLAY, focusRequestId: current.focusRequestId });
  }, []);

  const openMenu = useCallback((collectionIndex, { focusFirstControl }) => {
    setOverlay(current => ({
      ...CLOSED_OVERLAY,
      collectionIndex,
      mode: 'menu',
      focus: focusFirstControl ? 'first' : null,
      focusRequestId: current.focusRequestId + 1,
    }));
  }, []);

  // Closing the menu or the move state goes back to the hover overlay of the
  // card under the mouse pointer, if any
  const dismiss = useCallback(({ returnFocus = false } = {}) => {
    const { collectionIndex } = overlayRef.current;

    setOverlay(current => ({
      ...CLOSED_OVERLAY,
      collectionIndex: hoveredCollectionIndexRef.current,
      focusRequestId: current.focusRequestId,
    }));

    if (returnFocus) cardButtonsRef.current.get(collectionIndex)?.focus();
  }, []);

  const handleStartMove = useCallback(() => {
    setOverlay(current => ({ ...current, danger: false, moving: true }));
  }, []);

  const handleDangerChange = useCallback((danger) => {
    setOverlay(current => ({ ...current, danger }));
  }, []);

  const moveCardBy = useCallback((collectionIndex, offset, event) => {
    const targetIndex = collectionIndex + offset;
    moveCard(collectionIndex, targetIndex);

    // A sticky overlay follows the moved card so it can be moved again right
    // away. When just hovering, it stays on the slot under the pointer.
    setOverlay(current => isSticky(current)
      ? {
        ...current,
        collectionIndex: targetIndex,
        focus: isKeyboardClick(event) ? (offset < 0 ? 'move-up' : 'move-down') : null,
        focusRequestId: current.focusRequestId + 1,
      }
      : current);
  }, [moveCard]);

  // Clicking or tapping anywhere outside a sticky overlay dismisses it
  const isOverlaySticky = overlay.collectionIndex != null && isSticky(overlay);
  useEffect(() => {
    if (!isOverlaySticky) return undefined;

    const handlePointerDown = (event) => {
      if (!event.target.closest('.sheet-slot-overlay.open')) dismiss();
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isOverlaySticky, dismiss]);

  /** Props for the element containing a card slot */
  const getSlotProps = (collectionIndex) => ({
    onPointerEnter: (event) => {
      if (event.pointerType === 'touch') return;
      hoveredCollectionIndexRef.current = collectionIndex;
      openHover(collectionIndex);
    },
    onPointerLeave: (event) => {
      if (event.pointerType === 'touch') return;
      if (hoveredCollectionIndexRef.current === collectionIndex) hoveredCollectionIndexRef.current = null;
      closeHover(collectionIndex);
    },
    onKeyDown: (event) => {
      if (event.key !== 'Escape' || overlayRef.current.collectionIndex !== collectionIndex) return;
      dismiss({ returnFocus: true });
    },
    // Moving the focus out of the menu (e.g. tabbing to the next card) closes it
    onBlur: (event) => {
      const { mode, collectionIndex: openCollectionIndex } = overlayRef.current;
      const nextFocus = event.relatedTarget;
      if (mode !== 'menu' || openCollectionIndex !== collectionIndex || !nextFocus) return;
      if (!nextFocus.closest('.sheet-slot-overlay.open')) dismiss();
    },
  });

  /** Props for the button covering a card, which opens the menu */
  const getCardButtonProps = (collectionIndex, { isMainFace }) => ({
    ref: isMainFace
      ? (button) => button
        ? cardButtonsRef.current.set(collectionIndex, button)
        : cardButtonsRef.current.delete(collectionIndex)
      : undefined,
    // Only one tab stop per collection card
    tabIndex: isMainFace ? 0 : -1,
    'aria-expanded': overlay.collectionIndex === collectionIndex && overlay.mode === 'menu',
    onClick: (event) => openMenu(collectionIndex, { focusFirstControl: isKeyboardClick(event) }),
  });

  /** Props for the `SheetSlotOverlay` of a card slot */
  const getOverlayProps = (collectionIndex) => {
    const open = overlay.collectionIndex === collectionIndex;

    return {
      open,
      mode: open ? overlay.mode : 'hover',
      danger: open && overlay.danger,
      isMoving: open && overlay.moving,
      focus: open ? overlay.focus : null,
      focusRequestId: overlay.focusRequestId,
      canMoveUp: collectionIndex > 0,
      canMoveDown: collectionIndex < collectionSize - 1,
      onStartMove: handleStartMove,
      onMoveUp: (event) => moveCardBy(collectionIndex, -1, event),
      onMoveDown: (event) => moveCardBy(collectionIndex, 1, event),
      onDelete: () => {
        dismiss();
        removeCardAt(collectionIndex);
      },
      onDismiss: (event) => dismiss({ returnFocus: isKeyboardClick(event) }),
      onDangerChange: handleDangerChange,
    };
  };

  return { getSlotProps, getCardButtonProps, getOverlayProps };
};
