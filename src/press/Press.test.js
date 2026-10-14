import { fireEvent, render, screen, within } from '@testing-library/react';
import Press from './Press';
import { SettingsContextProvider } from '../settings';
import { fetchCardData } from '../utils/scryfall';

// jsdom has no canvas, so card components are replaced with plain elements
jest.mock('../cards/Card', () => ({ cardName }) => <div>{cardName}</div>);
jest.mock('../cards/DualCard', () => () => <div>Dual card</div>);
jest.mock('jspdf', () => ({ jsPDF: jest.fn() }));
jest.mock('../utils/scryfall', () => ({
  fetchCardData: jest.fn(),
  fetchSymbology: jest.fn(() => Promise.resolve({ data: [] })),
}));

// jsdom has no PointerEvent, which the overlay needs to tell mouse and touch apart
beforeAll(() => {
  window.PointerEvent = class PointerEvent extends MouseEvent {
    constructor(type, { pointerType = '', ...init } = {}) {
      super(type, init);
      this.pointerType = pointerType;
    }
  };
});

afterAll(() => {
  delete window.PointerEvent;
});

const singleCard = { name: 'Colossal Dreadmaw', set: 'm21', multiverse_ids: [1] };
const doubleFacedCard = {
  name: 'Front // Back',
  layout: 'transform',
  set: 'abc',
  multiverse_ids: [2],
  card_faces: [{ name: 'Front' }, { name: 'Back' }],
};

const renderPress = () => {
  // Double-faced cards are shown as separate faces by default
  sessionStorage.setItem('press:cardCollection', JSON.stringify([singleCard, doubleFacedCard]));
  const { container } = render(<SettingsContextProvider><Press /></SettingsContextProvider>);

  // The overlay's open and danger states are only visible through its classes
  /* eslint-disable testing-library/no-container, testing-library/no-node-access */
  const slots = [...container.querySelectorAll('.sheet-slot')];
  const overlays = [...container.querySelectorAll('.sheet-slot-overlay')];
  /* eslint-enable testing-library/no-container, testing-library/no-node-access */
  const openOverlays = () => overlays.map(overlay => overlay.classList.contains('open'));
  const dangerOverlays = () => overlays.map(overlay => overlay.classList.contains('danger'));

  return { slots, overlays, openOverlays, dangerOverlays };
};

const cardOrder = () => screen
  .getAllByText(/^(Colossal Dreadmaw|Front|Back)$/)
  .map(element => element.textContent);

const cardButton = (cardName) => screen.getByRole('button', { name: `Actions for ${cardName}` });

const hover = (slot) => fireEvent.pointerEnter(slot, { pointerType: 'mouse' });
const unhover = (slot) => fireEvent.pointerLeave(slot, { pointerType: 'mouse' });
// A tap fires pointer events with the touch pointer type, then a click
const tap = (slot, cardName) => {
  fireEvent.pointerEnter(slot, { pointerType: 'touch' });
  fireEvent.click(cardButton(cardName), { detail: 1 });
};
// Clicks triggered with Enter or Space have no click count
const pressWithKeyboard = (button) => fireEvent.click(button, { detail: 0 });

const startMoving = (slot, index) => {
  hover(slot);
  fireEvent.click(screen.getAllByRole('button', { name: /move\.\.\./i })[index], { detail: 1 });
};

afterEach(() => {
  sessionStorage.clear();
});

test('numbers the pages below each sheet', () => {
  // 9 cards fit in a sheet, so 10 cards need two
  const cards = Array.from({ length: 10 }, (_, i) => ({ name: `Card ${i}`, set: 'abc', multiverse_ids: [i] }));
  sessionStorage.setItem('press:cardCollection', JSON.stringify(cards));
  render(<SettingsContextProvider><Press /></SettingsContextProvider>);

  expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();
  expect(screen.getByText('Page 2 of 2')).toBeInTheDocument();
});

test('shows a placeholder while a card is loading', () => {
  fetchCardData.mockReturnValue(new Promise(() => {}));
  render(<SettingsContextProvider><Press /></SettingsContextProvider>);

  fireEvent.change(screen.getByPlaceholderText(/colossal dreadmaw/i), { target: { value: 'Lightning Bolt' } });
  fireEvent.click(screen.getByRole('button', { name: 'Add card' }));

  expect(screen.getByRole('status')).toHaveTextContent('Loading card details');
});

describe('hovering with a mouse', () => {
  test('hovering any face opens the overlay of all the faces of that card', () => {
    const { slots, openOverlays } = renderPress();

    hover(slots[2]);
    expect(openOverlays()).toEqual([false, true, true]);

    unhover(slots[2]);
    expect(openOverlays()).toEqual([false, false, false]);
  });

  test('shows "Move..." and "Delete", only on single cards and main faces', () => {
    const { slots } = renderPress();
    hover(slots[0]);

    expect(screen.getAllByRole('button', { name: /move\.\.\./i })).toHaveLength(2);
    expect(screen.getAllByRole('button', { name: /delete/i })).toHaveLength(2);
    expect(screen.queryByRole('button', { name: /move (up|down)/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /dismiss/i })).not.toBeInTheDocument();
  });

  test('hovering the delete button turns all the faces red', () => {
    const { slots, dangerOverlays } = renderPress();
    hover(slots[1]);
    const deleteButton = screen.getAllByRole('button', { name: /delete/i })[1];

    fireEvent.mouseEnter(deleteButton);
    expect(dangerOverlays()).toEqual([false, true, true]);

    fireEvent.mouseLeave(deleteButton);
    expect(dangerOverlays()).toEqual([false, false, false]);
  });

  test('deleting removes all the faces of the card', () => {
    const { slots } = renderPress();
    hover(slots[1]);

    fireEvent.click(screen.getAllByRole('button', { name: /delete/i })[1]);

    expect(screen.queryByText('Front')).not.toBeInTheDocument();
    expect(screen.queryByText('Back')).not.toBeInTheDocument();
    expect(screen.getByText('Colossal Dreadmaw')).toBeInTheDocument();
  });

  describe('move state', () => {
    test('shows the move buttons and "Close", but not "Delete"', () => {
      const { slots } = renderPress();

      startMoving(slots[0], 0);

      // The single card is first, so it can only move down
      expect(screen.getByRole('button', { name: /move down/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /move up/i })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
      expect(screen.getAllByRole('button', { name: /delete/i })).toHaveLength(1);
    });

    test('keeps the overlay open while hovering other cards', () => {
      const { slots, openOverlays } = renderPress();
      startMoving(slots[0], 0);

      unhover(slots[0]);
      hover(slots[2]);

      expect(openOverlays()).toEqual([true, false, false]);
    });

    test('moves a card one position down, and the overlay follows it', () => {
      const { slots, openOverlays } = renderPress();
      startMoving(slots[0], 0);

      fireEvent.click(screen.getByRole('button', { name: /move down/i }), { detail: 1 });

      expect(cardOrder()).toEqual(['Front', 'Back', 'Colossal Dreadmaw']);
      // Overlays are listed in their initial order: the single card's is still open
      expect(openOverlays()).toEqual([true, false, false]);
      expect(screen.getByRole('button', { name: /move up/i })).toBeInTheDocument();
    });

    test('moves all the faces of a double-faced card one position up', () => {
      const { slots } = renderPress();
      startMoving(slots[2], 1);

      fireEvent.click(screen.getByRole('button', { name: /move up/i }), { detail: 1 });

      expect(cardOrder()).toEqual(['Front', 'Back', 'Colossal Dreadmaw']);
    });

    test('"Close" goes back to the hover overlay of the card under the pointer', () => {
      const { slots, openOverlays } = renderPress();
      startMoving(slots[0], 0);

      fireEvent.click(screen.getByRole('button', { name: /close/i }), { detail: 1 });

      expect(openOverlays()).toEqual([true, false, false]);
      expect(screen.queryByRole('button', { name: /close/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /move (up|down)/i })).not.toBeInTheDocument();
    });

    test('clicking another card leaves the move state and shows that card\'s hover overlay', () => {
      const { slots, openOverlays } = renderPress();
      startMoving(slots[0], 0);
      unhover(slots[0]);
      hover(slots[2]);

      fireEvent.pointerDown(slots[2]);

      expect(openOverlays()).toEqual([false, true, true]);
    });

    test('clicking outside the cards leaves the move state and closes the overlay', () => {
      const { slots, openOverlays } = renderPress();
      startMoving(slots[0], 0);
      unhover(slots[0]);

      fireEvent.pointerDown(document.body);

      expect(openOverlays()).toEqual([false, false, false]);
    });
  });
});

describe('tapping', () => {
  test('opens the menu of all the faces of the card, with all the actions and "Dismiss"', () => {
    const { slots, overlays, openOverlays } = renderPress();

    tap(slots[2], 'Back');

    expect(openOverlays()).toEqual([false, true, true]);
    const menu = within(overlays[1]);
    expect(menu.getByRole('button', { name: /move up/i })).toBeInTheDocument();
    expect(menu.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    expect(menu.getByRole('button', { name: /dismiss/i })).toBeInTheDocument();
    expect(menu.queryByRole('button', { name: /move\.\.\./i })).not.toBeInTheDocument();
  });

  test('does not open the hover overlay', () => {
    const { slots, openOverlays } = renderPress();

    fireEvent.pointerEnter(slots[2], { pointerType: 'touch' });

    expect(openOverlays()).toEqual([false, false, false]);
  });

  test('"Dismiss" closes the menu', () => {
    const { slots, openOverlays } = renderPress();
    tap(slots[2], 'Back');

    fireEvent.click(screen.getByRole('button', { name: /dismiss/i }), { detail: 1 });

    expect(openOverlays()).toEqual([false, false, false]);
  });

  test('the menu keeps its controls while fading out, instead of switching to the hover ones', () => {
    const { slots, overlays } = renderPress();
    tap(slots[2], 'Back');

    fireEvent.pointerDown(document.body);

    const closingMenu = within(overlays[1]);
    expect(closingMenu.getByRole('button', { name: /dismiss/i })).toBeInTheDocument();
    expect(closingMenu.queryByRole('button', { name: /move\.\.\./i })).not.toBeInTheDocument();
  });

  test('tapping outside the menu closes it', () => {
    const { slots, overlays, openOverlays } = renderPress();
    tap(slots[2], 'Back');

    fireEvent.pointerDown(overlays[1]);
    expect(openOverlays()).toEqual([false, true, true]);

    fireEvent.pointerDown(document.body);
    expect(openOverlays()).toEqual([false, false, false]);
  });

  test('the menu follows the moved card, so it can be moved again', () => {
    const { slots, openOverlays } = renderPress();
    tap(slots[0], 'Colossal Dreadmaw');

    fireEvent.click(screen.getByRole('button', { name: /move down/i }), { detail: 1 });

    expect(cardOrder()).toEqual(['Front', 'Back', 'Colossal Dreadmaw']);
    // Overlays are listed in their initial order: the single card's is still open
    expect(openOverlays()).toEqual([true, false, false]);
    expect(screen.getByRole('button', { name: /move up/i })).toBeInTheDocument();
  });

  test('the menu is red only while "Delete" is pressed', () => {
    const { slots, dangerOverlays } = renderPress();
    tap(slots[2], 'Back');
    const deleteButton = screen.getAllByRole('button', { name: /delete/i })[1];

    fireEvent.pointerDown(deleteButton, { pointerType: 'touch' });
    expect(dangerOverlays()).toEqual([false, true, true]);

    fireEvent.pointerUp(deleteButton, { pointerType: 'touch' });
    expect(dangerOverlays()).toEqual([false, false, false]);
  });
});

describe('keyboard', () => {
  test('has one tab stop per card, and none for the controls of closed overlays', () => {
    renderPress();

    expect(cardButton('Colossal Dreadmaw')).toHaveAttribute('tabindex', '0');
    expect(cardButton('Front')).toHaveAttribute('tabindex', '0');
    expect(cardButton('Back')).toHaveAttribute('tabindex', '-1');
    screen.getAllByRole('button', { name: /delete|move/i }).forEach(button => {
      expect(button).toHaveAttribute('tabindex', '-1');
    });
  });

  test('activating a card opens its menu and focuses the first control', () => {
    const { openOverlays } = renderPress();

    pressWithKeyboard(cardButton('Front'));

    expect(openOverlays()).toEqual([false, true, true]);
    expect(cardButton('Front')).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('button', { name: /move up/i })).toHaveFocus();
  });

  test('Escape closes the menu and returns the focus to the card', () => {
    const { openOverlays } = renderPress();
    pressWithKeyboard(cardButton('Front'));

    fireEvent.keyDown(screen.getByRole('button', { name: /move up/i }), { key: 'Escape' });

    expect(openOverlays()).toEqual([false, false, false]);
    expect(cardButton('Front')).toHaveFocus();
  });

  test('"Dismiss" returns the focus to the card', () => {
    renderPress();
    pressWithKeyboard(cardButton('Front'));

    pressWithKeyboard(screen.getByRole('button', { name: /dismiss/i }));

    expect(cardButton('Front')).toHaveFocus();
  });

  test('moving keeps the focus in the menu of the moved card', () => {
    renderPress();
    pressWithKeyboard(cardButton('Colossal Dreadmaw'));

    pressWithKeyboard(screen.getByRole('button', { name: /move down/i }));

    expect(cardOrder()).toEqual(['Front', 'Back', 'Colossal Dreadmaw']);
    // It's now the last card, so "Move down" is gone and the focus moves to the first control
    expect(screen.getByRole('button', { name: /move up/i })).toHaveFocus();
  });
});
