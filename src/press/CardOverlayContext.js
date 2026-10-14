import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { isKeyboardClick } from '../utils/events';

/**
 * @typedef {object} OverlayState
 * @prop {number|null} collectionIndex - Collection card the overlay is open for
 * @prop {'hover'|'move-submenu'|'menu'} mode - `hover` while hovering with a
 *   mouse or pen; `move-submenu` after choosing "Move..." in the hover overlay
 *   (sticky, with "Close"); `menu` when opened by tapping or from the keyboard
 *   (sticky, with "Dismiss")
 * @prop {boolean} danger - Whether to show the destructive (red) state
 * @prop {'first'|'move-up'|'move-down'|null} focus - Control to focus after
 *   opening the menu or moving a card from the keyboard
 * @prop {number} focusRequestId - Changes on every focus request
 */

/** @type {OverlayState} */
const CLOSED_OVERLAY = {
  collectionIndex: null,
  mode: 'hover',
  danger: false,
  focus: null,
  focusRequestId: 0,
};

const isSticky = (overlay) => overlay.mode !== 'hover';


const CardOverlayContext = createContext(null);

/**
 * Overlay with the actions for the cards in the press. A single overlay is
 * shared by all the slots of the press, so that:
 * - All the slots of a collection card (e.g. both faces of a double-faced card)
 *   open, change color and close together
 * - Only one card shows it at a time, and while it's sticky (menu or move
 *   submenu) hovering other cards doesn't change it
 *
 * How it opens depends on each interaction rather than on the device, so it
 * also works on devices with both a mouse and a touch screen:
 * - Hovering a card with a mouse or pen opens the hover overlay
 * - Tapping a card, or activating it from the keyboard, opens the menu, which
 *   stays open until dismissed or until clicking outside of it
 *
 * @param {object} props
 * @param {number} props.collectionSize - Number of cards in the collection
 * @param {function(fromIndex: number, toIndex: number): void} props.moveCard
 * @param {function(index: number): void} props.removeCardAt
 */
export const CardOverlayProvider = ({ collectionSize, moveCard, removeCardAt, children }) => {
  const [overlay, setOverlay] = useState(CLOSED_OVERLAY);
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

  // Closing the menu or the move submenu goes back to the hover overlay of the
  // card under the mouse pointer, if any. `returnFocusTo` is the collection
  // card whose button gets the focus back (e.g. when closed from the keyboard).
  const dismissMenu = useCallback(({ returnFocusTo = null } = {}) => {
    setOverlay(current => ({
      ...CLOSED_OVERLAY,
      collectionIndex: hoveredCollectionIndexRef.current,
      focusRequestId: current.focusRequestId,
    }));

    if (returnFocusTo != null) cardButtonsRef.current.get(returnFocusTo)?.focus();
  }, []);

  const handleStartMove = useCallback(() => {
    setOverlay(current => ({ ...current, danger: false, mode: 'move-submenu' }));
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

  const deleteCard = useCallback((collectionIndex) => {
    dismissMenu();
    removeCardAt(collectionIndex);
  }, [dismissMenu, removeCardAt]);

  // Clicking or tapping anywhere outside a sticky overlay dismisses it
  const isOverlaySticky = overlay.collectionIndex != null && isSticky(overlay);
  useEffect(() => {
    if (!isOverlaySticky) return undefined;

    const handlePointerDown = (event) => {
      if (!event.target.closest('.sheet-slot-overlay.open')) dismissMenu();
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isOverlaySticky, dismissMenu]);

  const value = useMemo(() => ({
    overlay,
    hoveredCollectionIndexRef,
    cardButtonsRef,
    collectionSize,
    openHover,
    closeHover,
    openMenu,
    dismissMenu,
    handleStartMove,
    handleDangerChange,
    moveCardBy,
    deleteCard,
  }), [overlay, collectionSize, openHover, closeHover, openMenu, dismissMenu, handleStartMove, handleDangerChange, moveCardBy, deleteCard]);

  return <CardOverlayContext.Provider value={value}>{children}</CardOverlayContext.Provider>;
};

/**
 * State and actions of the card overlay. Must be used within a
 * `CardOverlayProvider`.
 */
export const useCardOverlayContext = () => {
  const context = useContext(CardOverlayContext);
  if (!context) throw new Error('useCardOverlayContext must be used within a CardOverlayProvider');
  return context;
};
