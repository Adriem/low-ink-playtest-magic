import type { FocusEvent, KeyboardEvent, MouseEvent, PointerEvent, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { SheetFace } from '../../domain/press';
import { isKeyboardClick } from '../../utils/events';
import { useCardOverlayContext } from './CardOverlayContext';
import SheetSlotOverlay from './SheetSlotOverlay';

import './SheetSlot.css';

/**
 * Slot of a press sheet showing a card (or one of its faces), with the button
 * and the overlay for the card's actions. Must be used within a
 * `CardOverlayProvider`.
 *
 * @param props.collectionIndex - Collection card the slot shows
 * @param props.face - Which face of the card this slot shows
 * @param props.cardName - Name of the card, for the actions button label
 * @param props.children - The card itself
 */
const SheetSlot = ({
  collectionIndex,
  face,
  cardName,
  children,
}: {
  collectionIndex: number;
  face: SheetFace;
  cardName: string;
  children: ReactNode;
}) => {
  const { t } = useTranslation();
  const {
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
  } = useCardOverlayContext();

  const open = overlay.collectionIndex === collectionIndex;
  // Only single cards and main faces are tab stops and get the focus back
  const isMainFace = face !== 'secondary';

  const handlePointerEnter = (event: PointerEvent) => {
    if (event.pointerType === 'touch') return;
    hoveredCollectionIndexRef.current = collectionIndex;
    openHover(collectionIndex);
  };

  const handlePointerLeave = (event: PointerEvent) => {
    if (event.pointerType === 'touch') return;
    if (hoveredCollectionIndexRef.current === collectionIndex) hoveredCollectionIndexRef.current = null;
    closeHover(collectionIndex);
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Escape' || !open) return;
    dismissMenu({ returnFocusTo: collectionIndex });
  };

  // Moving the focus out of the menu (e.g. tabbing to the next card) closes it
  const handleBlur = (event: FocusEvent) => {
    const nextFocus = event.relatedTarget;
    if (!open || overlay.mode !== 'menu' || !nextFocus) return;
    if (!nextFocus.closest('.sheet-slot-overlay.open')) dismissMenu();
  };

  const registerCardButton = (button: HTMLButtonElement | null) => {
    if (button) cardButtonsRef.current.set(collectionIndex, button);
    else cardButtonsRef.current.delete(collectionIndex);
  };

  const handleCardButtonClick = (event: MouseEvent) => {
    openMenu(collectionIndex, { focusFirstControl: isKeyboardClick(event) });
  };

  const handleMoveUp = (event: MouseEvent) => {
    return moveCardBy(collectionIndex, -1, event);
  };
  const handleMoveDown = (event: MouseEvent) => {
    return moveCardBy(collectionIndex, 1, event);
  };
  const handleDelete = (event: MouseEvent) => {
    return deleteCard(collectionIndex, event);
  };
  const handleOverrideArt = () => {
    return overrideArt?.(collectionIndex);
  };
  const handleDismiss = (event: MouseEvent) => {
    dismissMenu({ returnFocusTo: isKeyboardClick(event) ? collectionIndex : null });
  };

  return (
    // Not interactive itself: it handles the events bubbling up from the controls inside it
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      className="sheet-slot"
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
    >
      {/* Opens the card's menu when tapped or activated from the keyboard */}
      <button
        type="button"
        className="sheet-slot-card-button"
        aria-label={t('card_overlay.actions_for', { cardName })}
        aria-expanded={open && overlay.mode === 'menu'}
        ref={isMainFace ? registerCardButton : undefined}
        tabIndex={isMainFace ? 0 : -1}
        onClick={handleCardButtonClick}
      />
      <SheetSlotOverlay
        face={face}
        open={open}
        mode={open ? overlay.mode : 'hover'}
        danger={open && overlay.danger}
        focus={open ? overlay.focus : null}
        focusRequestId={overlay.focusRequestId}
        canMoveUp={collectionIndex > 0}
        canMoveDown={collectionIndex < collectionSize - 1}
        onStartMove={handleStartMove}
        onMoveUp={handleMoveUp}
        onMoveDown={handleMoveDown}
        onDelete={handleDelete}
        onOverrideArt={overrideArt && handleOverrideArt}
        onDismiss={handleDismiss}
        onDangerChange={handleDangerChange}
      />
      {children}
    </div>
  );
};

export default SheetSlot;
