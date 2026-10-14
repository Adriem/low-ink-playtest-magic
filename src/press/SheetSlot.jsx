import { isKeyboardClick } from '../utils/events';
import { useCardOverlayContext } from './CardOverlayContext';
import SheetSlotOverlay from './SheetSlotOverlay';

import './SheetSlot.css';

/**
 * Slot of a press sheet showing a card (or one of its faces), with the button
 * and the overlay for the card's actions. Must be used within a
 * `CardOverlayProvider`.
 *
 * @param {object} props
 * @param {number} props.collectionIndex - Collection card the slot shows
 * @param {'single'|'main'|'secondary'} props.face - Which face of the card this slot shows
 * @param {string} props.cardName - Name of the card, for the actions button label
 * @param {React.ReactNode} props.children - The card itself
 */
const SheetSlot = ({ collectionIndex, face, cardName, children }) => {
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
  } = useCardOverlayContext();

  const open = overlay.collectionIndex === collectionIndex;
  // Only single cards and main faces are tab stops and get the focus back
  const isMainFace = face !== 'secondary';

  const handlePointerEnter = (event) => {
    if (event.pointerType === 'touch') return;
    hoveredCollectionIndexRef.current = collectionIndex;
    openHover(collectionIndex);
  };

  const handlePointerLeave = (event) => {
    if (event.pointerType === 'touch') return;
    if (hoveredCollectionIndexRef.current === collectionIndex) hoveredCollectionIndexRef.current = null;
    closeHover(collectionIndex);
  };

  const handleKeyDown = (event) => {
    if (event.key !== 'Escape' || !open) return;
    dismissMenu({ returnFocusTo: collectionIndex });
  };

  // Moving the focus out of the menu (e.g. tabbing to the next card) closes it
  const handleBlur = (event) => {
    const nextFocus = event.relatedTarget;
    if (!open || overlay.mode !== 'menu' || !nextFocus) return;
    if (!nextFocus.closest('.sheet-slot-overlay.open')) dismissMenu();
  };

  const registerCardButton = (button) => {
    if (button) cardButtonsRef.current.set(collectionIndex, button);
    else cardButtonsRef.current.delete(collectionIndex);
  };

  const handleCardButtonClick = (event) => {
    openMenu(collectionIndex, { focusFirstControl: isKeyboardClick(event) });
  };

  const handleMoveUp = (event) => moveCardBy(collectionIndex, -1, event);
  const handleMoveDown = (event) => moveCardBy(collectionIndex, 1, event);
  const handleDelete = () => deleteCard(collectionIndex);
  const handleDismiss = (event) => {
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
        aria-label={`Actions for ${cardName}`}
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
        onDismiss={handleDismiss}
        onDangerChange={handleDangerChange}
      />
      {children}
    </div>
  );
};

export default SheetSlot;
