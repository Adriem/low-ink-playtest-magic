import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';
import { isKeyboardClick } from '../../utils/events';

/**
 * `hover` while hovering with a mouse or pen; `move-submenu` after choosing
 * "Move..." in the hover overlay (sticky, with "Close"); `menu` when opened by
 * tapping or from the keyboard (sticky, with "Dismiss")
 */
export type OverlayMode = 'hover' | 'move-submenu' | 'menu';

/** Control to focus after opening the menu or moving a card from the keyboard */
export type OverlayFocus = 'first' | 'move-up' | 'move-down';

export interface OverlayState {
  /** Collection card the overlay is open for */
  collectionIndex: number | null;
  mode: OverlayMode;
  /** Whether to show the destructive (red) state */
  danger: boolean;
  focus: OverlayFocus | null;
  /** Changes on every focus request */
  focusRequestId: number;
}

/** A click, or anything else that tells whether it came from the keyboard */
type ClickLike = { detail: number };

interface CardOverlayContextValue {
  overlay: OverlayState;
  hoveredCollectionIndexRef: RefObject<number | null>;
  cardButtonsRef: RefObject<Map<number, HTMLButtonElement>>;
  collectionSize: number;
  openHover: (collectionIndex: number) => void;
  closeHover: (collectionIndex: number) => void;
  openMenu: (collectionIndex: number, options: { focusFirstControl: boolean }) => void;
  dismissMenu: (options?: { returnFocusTo?: number | null }) => void;
  handleStartMove: () => void;
  handleDangerChange: (danger: boolean) => void;
  moveCardBy: (collectionIndex: number, offset: number, event?: ClickLike) => void;
  deleteCard: (collectionIndex: number) => void;
  /** Override the art of a card, where cards are drawn with art */
  overrideArt?: (collectionIndex: number) => void;
}

const CLOSED_OVERLAY: OverlayState = {
  collectionIndex: null,
  mode: 'hover',
  danger: false,
  focus: null,
  focusRequestId: 0,
};

const CardOverlayContext = createContext<CardOverlayContextValue | null>(null);

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
 * @param props.collectionSize - Number of cards in the collection
 */
export const CardOverlayProvider = ({
  collectionSize,
  moveCard,
  removeCardAt,
  onOverrideArt,
  children,
}: {
  collectionSize: number;
  moveCard: (fromIndex: number, toIndex: number) => void;
  removeCardAt: (index: number) => void;
  /** Called to override the art of a card, which cards only offer with it */
  onOverrideArt?: (collectionIndex: number) => void;
  children: ReactNode;
}) => {
  const [overlay, setOverlay] = useState(CLOSED_OVERLAY);
  // Card under the mouse pointer, tracked even while the overlay is sticky
  const hoveredCollectionIndexRef = useRef<number | null>(null);
  // Card buttons of the main face of each collection card, to return focus to them
  const cardButtonsRef = useRef(new Map<number, HTMLButtonElement>());

  const openHover = useCallback((collectionIndex: number) => {
    setOverlay((current) =>
      isSticky(current) || current.collectionIndex === collectionIndex
        ? current
        : { ...CLOSED_OVERLAY, collectionIndex, focusRequestId: current.focusRequestId },
    );
  }, []);

  const closeHover = useCallback((collectionIndex: number) => {
    setOverlay((current) =>
      isSticky(current) || current.collectionIndex !== collectionIndex
        ? current
        : { ...CLOSED_OVERLAY, focusRequestId: current.focusRequestId },
    );
  }, []);

  const openMenu = useCallback((collectionIndex: number, { focusFirstControl }: { focusFirstControl: boolean }) => {
    setOverlay((current): OverlayState => ({
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
  const dismissMenu = useCallback(({ returnFocusTo = null }: { returnFocusTo?: number | null } = {}) => {
    setOverlay((current) => ({
      ...CLOSED_OVERLAY,
      collectionIndex: hoveredCollectionIndexRef.current,
      focusRequestId: current.focusRequestId,
    }));

    if (returnFocusTo != null) cardButtonsRef.current.get(returnFocusTo)?.focus();
  }, []);

  const handleStartMove = useCallback(() => {
    setOverlay((current): OverlayState => ({ ...current, danger: false, mode: 'move-submenu' }));
  }, []);

  const handleDangerChange = useCallback((danger: boolean) => {
    setOverlay((current) => ({ ...current, danger }));
  }, []);

  const moveCardBy = useCallback(
    (collectionIndex: number, offset: number, event?: ClickLike) => {
      const targetIndex = collectionIndex + offset;
      moveCard(collectionIndex, targetIndex);

      // A sticky overlay follows the moved card so it can be moved again right
      // away. When just hovering, it stays on the slot under the pointer.
      setOverlay((current): OverlayState =>
        isSticky(current)
          ? {
              ...current,
              collectionIndex: targetIndex,
              focus: isKeyboardClick(event) ? (offset < 0 ? 'move-up' : 'move-down') : null,
              focusRequestId: current.focusRequestId + 1,
            }
          : current,
      );
    },
    [moveCard],
  );

  const deleteCard = useCallback(
    (collectionIndex: number) => {
      dismissMenu();
      removeCardAt(collectionIndex);
    },
    [dismissMenu, removeCardAt],
  );

  const overrideArt = useMemo(
    () =>
      onOverrideArt &&
      ((collectionIndex: number) => {
        dismissMenu();
        onOverrideArt(collectionIndex);
      }),
    [dismissMenu, onOverrideArt],
  );

  // Clicking or tapping anywhere outside a sticky overlay dismisses it
  const isOverlaySticky = overlay.collectionIndex != null && isSticky(overlay);
  useEffect(() => {
    if (!isOverlaySticky) return undefined;

    const handlePointerDown = (event: PointerEvent) => {
      if (!(event.target as Element).closest('.sheet-slot-overlay.open')) dismissMenu();
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isOverlaySticky, dismissMenu]);

  const value = useMemo(
    (): CardOverlayContextValue => ({
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
      overrideArt,
    }),
    [
      overlay,
      collectionSize,
      openHover,
      closeHover,
      openMenu,
      dismissMenu,
      handleStartMove,
      handleDangerChange,
      moveCardBy,
      deleteCard,
      overrideArt,
    ],
  );

  return <CardOverlayContext.Provider value={value}>{children}</CardOverlayContext.Provider>;
};

const isSticky = (overlay: OverlayState) => {
  return overlay.mode !== 'hover';
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
