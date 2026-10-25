import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import type { RefCallback } from 'react';
import Press from './Press';
import { SettingsContextProvider } from '../settings';
import { exportToPDF } from '../../adapters/jspdf';
import { fetchCard, fetchCollection } from '../../adapters/scryfall';
import type { CardFace } from '../../domain/cards';
import { overrideFlag, testCard, testFace } from '../../testUtils';
import { loadFromStorage, saveToStorage } from '../../utils/storage';

// jsdom has no canvas drawing, so card components are replaced with their name and a blank canvas (titled with its art fidelity)
vi.mock('../cards/Card', () => ({
  default: ({
    face,
    defaultArtFidelity,
    ref,
  }: {
    face: CardFace;
    defaultArtFidelity: string;
    ref?: RefCallback<HTMLCanvasElement>;
  }) => (
    <div>
      {face.name}
      <canvas
        ref={ref}
        data-name={face.name}
        title={`Art fidelity: ${defaultArtFidelity}`}
        aria-label={face.artOverride && `Art of ${face.artOverride.url}`}
      />
    </div>
  ),
}));
vi.mock('../cards/DualCard', () => ({
  default: ({ ref }: { ref?: RefCallback<HTMLCanvasElement> }) => (
    <div>
      Dual card
      <canvas ref={ref} data-name="Dual card" />
    </div>
  ),
}));
vi.mock('../../adapters/jspdf', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../adapters/jspdf')>()),
  exportToPDF: vi.fn(),
}));
vi.mock('../../adapters/scryfall', () => ({
  fetchCard: vi.fn(),
  fetchCollection: vi.fn(),
  getSymbolImage: vi.fn(() => Promise.resolve(undefined)),
}));

const singleCard = testCard({ name: 'Colossal Dreadmaw', set: 'm21', multiverseIds: ['1'] });
const doubleFacedCard = testCard({
  name: 'Front // Back',
  layout: 'double-faced',
  set: 'abc',
  multiverseIds: ['2'],
  mainFace: testFace({ name: 'Front' }),
  secondaryFace: testFace({ name: 'Back' }),
});

// jsdom has no modal dialogs, so opening one only shows it, and closing it hides it and says so
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function () {
    this.open = false;
    this.dispatchEvent(new Event('close'));
  };
});

afterAll(() => {
  delete (HTMLDialogElement.prototype as Partial<HTMLDialogElement>).showModal;
  delete (HTMLDialogElement.prototype as Partial<HTMLDialogElement>).close;
});

// jsdom has no PointerEvent, which the overlay needs to tell mouse and touch apart
beforeAll(() => {
  window.PointerEvent = class PointerEvent extends MouseEvent {
    pointerType: string;

    constructor(type: string, { pointerType = '', ...init }: PointerEventInit = {}) {
      super(type, init);
      this.pointerType = pointerType;
    }
  } as typeof window.PointerEvent;
});

afterAll(() => {
  delete (window as { PointerEvent?: unknown }).PointerEvent;
});

afterEach(() => {
  sessionStorage.clear();
  localStorage.clear();
});

test('numbers the pages below each sheet', () => {
  // 9 cards fit in a sheet, so 10 cards need two
  const cards = Array.from({ length: 10 }, (_, i) => testCard({ name: `Card ${i}`, multiverseIds: [String(i)] }));
  saveToStorage('sessionStorage', 'press:CARD_COLLECTION@1', cards);
  render(
    <SettingsContextProvider>
      <Press />
    </SettingsContextProvider>,
  );

  expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();
  expect(screen.getByText('Page 2 of 2')).toBeInTheDocument();
});

test('draws the art with the art fidelity setting only with its flag on, else with the include art one', () => {
  saveToStorage('sessionStorage', 'press:CARD_COLLECTION@1', [singleCard]);
  saveToStorage('localStorage', 'press:SETTINGS@1', { artFidelity: 'contours', includeArt: 'no-filter' });
  render(
    <SettingsContextProvider>
      <Press />
    </SettingsContextProvider>,
  );

  expect(screen.getByTitle('Art fidelity: no-filter')).toBeInTheDocument();

  act(() => {
    overrideFlag('ART_FIDELITY_SLIDER', true);
  });

  expect(screen.getByTitle('Art fidelity: contours')).toBeInTheDocument();
});

test('shows a placeholder while a card is loading', () => {
  vi.mocked(fetchCard).mockReturnValue(new Promise(() => {}));
  render(
    <SettingsContextProvider>
      <Press />
    </SettingsContextProvider>,
  );

  fireEvent.change(screen.getByPlaceholderText(/colossal dreadmaw/i), { target: { value: 'Lightning Bolt' } });
  fireEvent.click(screen.getByRole('button', { name: 'Add' }));

  expect(screen.getByRole('status')).toHaveTextContent('Loading card details');
});

test('reports the cards that could not be added all at once, until the next ones are added', async () => {
  // Lists are fetched together, each card or why it couldn't be
  vi.mocked(fetchCollection).mockImplementation(async (cardNames) =>
    cardNames.map((cardName) => (cardName === 'Colossal Dreadmaw' ? singleCard : new Error('Not found'))),
  );
  render(
    <SettingsContextProvider>
      <Press />
    </SettingsContextProvider>,
  );

  fireEvent.click(screen.getByLabelText('card list'));
  fireEvent.change(screen.getByPlaceholderText(/colossal dreadmaw/i), {
    target: { value: 'Lightnig Bolt\nColossal Dreadmaw\n2 Counterspel' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Add cards' }));

  const notice = await screen.findByRole('alert');
  await waitFor(() => expect(notice).toHaveTextContent("Couldn't add these 2 cards"));
  expect(
    within(notice)
      .getAllByRole('listitem')
      .map((item) => item.textContent),
  ).toEqual(['Lightnig Bolt', 'Counterspel']);
  expect(await screen.findByText('Colossal Dreadmaw')).toBeInTheDocument();

  fireEvent.change(screen.getByPlaceholderText(/colossal dreadmaw/i), { target: { value: 'Colossal Dreadmaw' } });
  fireEvent.click(screen.getByRole('button', { name: 'Add cards' }));
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

test('dismisses the cards that could not be added', async () => {
  vi.mocked(fetchCard).mockRejectedValue(new Error('Not found'));
  render(
    <SettingsContextProvider>
      <Press />
    </SettingsContextProvider>,
  );

  fireEvent.change(screen.getByPlaceholderText(/colossal dreadmaw/i), { target: { value: 'Lightnig Bolt' } });
  fireEvent.click(screen.getByRole('button', { name: 'Add' }));
  expect(await screen.findByRole('alert')).toHaveTextContent("Couldn't add this card");

  fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

test('shows a card that loads while a card added before it is still loading', async () => {
  vi.mocked(fetchCard).mockImplementation((cardName) =>
    cardName === 'Lightning Bolt' ? new Promise(() => {}) : Promise.resolve(singleCard),
  );
  render(
    <SettingsContextProvider>
      <Press />
    </SettingsContextProvider>,
  );

  const addCard = (cardName: string) => {
    fireEvent.change(screen.getByPlaceholderText(/colossal dreadmaw/i), { target: { value: cardName } });
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
  };
  addCard('Lightning Bolt');
  addCard('Colossal Dreadmaw');

  expect(await screen.findByText('Colossal Dreadmaw')).toBeInTheDocument();
  expect(screen.getByRole('status')).toHaveTextContent('Loading card details');
});

describe('exporting', () => {
  const exportedCardNames = () => {
    const [canvases] = vi.mocked(exportToPDF).mock.calls[0];
    return (canvases as HTMLCanvasElement[]).map((canvas) => canvas.dataset.name);
  };

  beforeEach(() => {
    vi.mocked(exportToPDF).mockClear();
  });

  // Export opens the export options, which export with their own button
  const exportPress = () => {
    fireEvent.click(screen.getByRole('button', { name: 'Export' }));
    fireEvent.click(within(screen.getByRole('dialog', { name: 'Export' })).getByRole('button', { name: 'Export' }));
  };

  test('exports with the options picked', async () => {
    renderPress();

    fireEvent.click(screen.getByRole('button', { name: 'Export' }));
    fireEvent.click(screen.getByLabelText('Letter'));
    fireEvent.change(screen.getByLabelText('File name'), { target: { value: 'my-deck' } });
    fireEvent.click(within(screen.getByRole('dialog', { name: 'Export' })).getByRole('button', { name: 'Export' }));

    await waitFor(() => expect(exportToPDF).toHaveBeenCalledTimes(1));
    expect(vi.mocked(exportToPDF).mock.calls[0][1]).toEqual({
      pageSize: 'letter',
      fileName: 'my-deck',
    });
    expect(loadFromStorage('localStorage', 'press:EXPORT_OPTIONS@1', {})).toEqual({
      pageSize: 'letter',
      fileName: 'my-deck',
    });
  });

  test('does not export while cards are loading', async () => {
    vi.mocked(fetchCard).mockReturnValue(new Promise(() => {}));
    renderPress();

    fireEvent.change(screen.getByPlaceholderText(/colossal dreadmaw/i), { target: { value: 'Lightning Bolt' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    expect(screen.getByRole('button', { name: 'Export' })).toBeDisabled();
  });

  test('says it is exporting until it is done, and reports errors', async () => {
    const alert = vi.spyOn(window, 'alert').mockImplementation(() => {});
    vi.mocked(exportToPDF).mockImplementationOnce(() => {
      throw new Error('Out of memory');
    });
    renderPress();

    exportPress();

    expect(screen.getByRole('button', { name: 'Exporting…' })).toBeDisabled();
    await waitFor(() => expect(alert).toHaveBeenCalledWith("Couldn't export the cards: Out of memory"));
    expect(screen.getByRole('button', { name: 'Export' })).toBeEnabled();
    alert.mockRestore();
  });

  test('does not export when canceling', async () => {
    renderPress();

    fireEvent.click(screen.getByRole('button', { name: 'Export' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(exportToPDF).not.toHaveBeenCalled();
  });

  test('exports the canvases of the cards in the order of the sheets', async () => {
    renderPress();

    exportPress();

    await waitFor(() => expect(exportToPDF).toHaveBeenCalledTimes(1));
    expect(exportedCardNames()).toEqual(['Colossal Dreadmaw', 'Front', 'Back']);
  });

  test('exports the cards of every sheet, including ones with the same key in different sheets', async () => {
    // Without multiverse IDs, the cards of each sheet are keyed by their position in it
    const cards = Array.from({ length: 10 }, (_, i) => testCard({ name: `Card ${i}` }));
    saveToStorage('sessionStorage', 'press:CARD_COLLECTION@1', cards);
    render(
      <SettingsContextProvider>
        <Press />
      </SettingsContextProvider>,
    );

    exportPress();

    await waitFor(() => expect(exportToPDF).toHaveBeenCalledTimes(1));
    expect(exportedCardNames()).toEqual(cards.map((card) => card.name));
  });
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

  test('offers to override the art of cards, opening a popup to do it', async () => {
    const { slots } = renderPress();
    hover(slots[0]);

    fireEvent.click(screen.getAllByRole('button', { name: /edit art/i })[0]);

    expect(await screen.findByRole('textbox', { name: 'Image URL', hidden: true })).toBeInTheDocument();
  });

  test('draws the card with its art as it is edited, until the popup closes without saving it', async () => {
    const { slots } = renderPress();
    hover(slots[0]);
    fireEvent.click(screen.getAllByRole('button', { name: /edit art/i })[0]);

    fireEvent.change(await screen.findByRole('textbox', { name: 'Image URL', hidden: true }), {
      target: { value: 'https://example.com/art.png' },
    });

    // Once typing pauses
    expect(await screen.findByLabelText('Art of https://example.com/art.png')).toBeInTheDocument();

    // Only the popup open is a dialog, as closed ones are hidden
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Cancel' }));

    expect(screen.queryByLabelText('Art of https://example.com/art.png')).not.toBeInTheDocument();
  });

  test('does not offer to override the art in styles without art', () => {
    saveToStorage('localStorage', 'press:SETTINGS@1', { cardVariant: 'minimalist' });
    const { slots } = renderPress();
    hover(slots[0]);

    expect(screen.queryByRole('button', { name: /edit art/i })).not.toBeInTheDocument();
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

    test("clicking another card leaves the move state and shows that card's hover overlay", () => {
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

const unhover = (slot: Element) => {
  return fireEvent.pointerLeave(slot, { pointerType: 'mouse' });
};

const startMoving = (slot: Element, index: number) => {
  hover(slot);
  fireEvent.click(screen.getAllByRole('button', { name: /move\.\.\./i })[index], { detail: 1 });
};

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

// A tap fires pointer events with the touch pointer type, then a click
const tap = (slot: Element, cardName: string) => {
  fireEvent.pointerEnter(slot, { pointerType: 'touch' });
  fireEvent.click(cardButton(cardName), { detail: 1 });
};

describe('keyboard', () => {
  test('has one tab stop per card, and none for the controls of closed overlays', () => {
    renderPress();

    expect(cardButton('Colossal Dreadmaw')).toHaveAttribute('tabindex', '0');
    expect(cardButton('Front')).toHaveAttribute('tabindex', '0');
    expect(cardButton('Back')).toHaveAttribute('tabindex', '-1');
    screen.getAllByRole('button', { name: /delete|move/i }).forEach((button) => {
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

  test('deleting the last card moves the focus to the one before it', () => {
    renderPress();

    pressWithKeyboard(cardButton('Front'));
    pressWithKeyboard(menuDeleteButton());

    expect(cardButton('Colossal Dreadmaw')).toHaveFocus();
  });

  test('deleting a card that has others after it moves the focus to the next one', () => {
    renderPress();

    pressWithKeyboard(cardButton('Colossal Dreadmaw'));
    pressWithKeyboard(menuDeleteButton());

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

// Clicks triggered with Enter or Space have no click count
const pressWithKeyboard = (button: Element) => {
  return fireEvent.click(button, { detail: 0 });
};

const renderPress = () => {
  // Double-faced cards are shown as separate faces by default
  saveToStorage('sessionStorage', 'press:CARD_COLLECTION@1', [singleCard, doubleFacedCard]);
  const { container } = render(
    <SettingsContextProvider>
      <Press />
    </SettingsContextProvider>,
  );

  // The overlay's open and danger states are only visible through its classes
  /* eslint-disable testing-library/no-container, testing-library/no-node-access */
  const slots = [...container.querySelectorAll<HTMLElement>('.sheet-slot')];
  const overlays = [...container.querySelectorAll<HTMLElement>('.sheet-slot-overlay')];
  /* eslint-enable testing-library/no-container, testing-library/no-node-access */
  const openOverlays = () => {
    return overlays.map((overlay) => overlay.classList.contains('open'));
  };
  const dangerOverlays = () => {
    return overlays.map((overlay) => overlay.classList.contains('danger'));
  };

  return { slots, overlays, openOverlays, dangerOverlays };
};

const cardOrder = () => {
  return screen.getAllByText(/^(Colossal Dreadmaw|Front|Back)$/).map((element) => element.textContent);
};

/** "Delete" in the open menu, the only one in the tab order */
const menuDeleteButton = () => {
  return screen.getAllByRole('button', { name: /delete/i }).find((button) => button.tabIndex === 0)!;
};

const cardButton = (cardName: string) => {
  return screen.getByRole('button', { name: `Actions for ${cardName}` });
};

const hover = (slot: Element) => {
  return fireEvent.pointerEnter(slot, { pointerType: 'mouse' });
};
