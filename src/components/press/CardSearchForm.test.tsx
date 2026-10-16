import { fireEvent, render, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import CardSearchForm from './CardSearchForm';

let user: UserEvent;
beforeEach(() => {
  user = userEvent.setup();
});

const setupForm = () => {
  const onAddCards = vi.fn();
  render(<CardSearchForm onAddCards={onAddCards} />);
  return onAddCards;
};

test('adds a single card by name', async () => {
  const onAddCards = setupForm();

  await user.type(screen.getByPlaceholderText(/colossal dreadmaw/i), '  Lightning Bolt ');
  await user.click(screen.getByRole('button', { name: 'Add card' }));

  expect(onAddCards).toHaveBeenCalledWith(['Lightning Bolt']);
});

test('clears the card name after adding it', async () => {
  setupForm();
  const input = screen.getByPlaceholderText(/colossal dreadmaw/i);

  await user.type(input, 'Lightning Bolt');
  await user.click(screen.getByRole('button', { name: 'Add card' }));

  expect(input).toHaveValue('');
});

test('does not add anything for an empty name', async () => {
  const onAddCards = setupForm();

  await user.click(screen.getByRole('button', { name: 'Add card' }));

  expect(onAddCards).not.toHaveBeenCalled();
});

test('adds a list of cards in order, ignoring empty lines', async () => {
  const onAddCards = setupForm();

  await user.click(screen.getByLabelText('card list'));
  fireEvent.change(screen.getByPlaceholderText(/colossal dreadmaw/i), {
    target: { value: 'Lightning Bolt\n\nCounterspell\n  Island  \n' },
  });
  await user.click(screen.getByRole('button', { name: 'Add cards' }));

  expect(onAddCards).toHaveBeenCalledWith(['Lightning Bolt', 'Counterspell', 'Island']);
});

test('clears the card list after adding it', async () => {
  setupForm();

  await user.click(screen.getByLabelText('card list'));
  const textarea = screen.getByPlaceholderText(/colossal dreadmaw/i);
  fireEvent.change(textarea, { target: { value: 'Lightning Bolt\nCounterspell' } });
  await user.click(screen.getByRole('button', { name: 'Add cards' }));

  expect(textarea).toHaveValue('');
});

test('switches between single card and card list modes', async () => {
  setupForm();

  expect(screen.getByLabelText('single card')).toBeChecked();
  expect(screen.getByRole('button', { name: 'Add card' })).toBeInTheDocument();

  await user.click(screen.getByLabelText('card list'));
  expect(screen.getByLabelText('card list')).toBeChecked();
  expect(screen.getByRole('button', { name: 'Add cards' })).toBeInTheDocument();

  await user.click(screen.getByLabelText('single card'));
  expect(screen.getByRole('button', { name: 'Add card' })).toBeInTheDocument();
});

describe('card list shortcut', () => {
  const fillCardList = async (cardList: string) => {
    await user.click(screen.getByLabelText('card list'));
    const textarea = screen.getByPlaceholderText(/colossal dreadmaw/i);
    fireEvent.change(textarea, { target: { value: cardList } });
    return textarea;
  };

  test('submits the list with Ctrl+Enter', async () => {
    const onAddCards = setupForm();
    const textarea = await fillCardList('Lightning Bolt\nCounterspell');

    fireEvent.keyDown(textarea, { key: 'Enter', ctrlKey: true });

    expect(onAddCards).toHaveBeenCalledWith(['Lightning Bolt', 'Counterspell']);
    expect(textarea).toHaveValue('');
  });

  test('submits the list with Cmd+Enter', async () => {
    const onAddCards = setupForm();
    const textarea = await fillCardList('Lightning Bolt');

    fireEvent.keyDown(textarea, { key: 'Enter', metaKey: true });

    expect(onAddCards).toHaveBeenCalledWith(['Lightning Bolt']);
  });

  test('does not submit the list with Enter alone', async () => {
    const onAddCards = setupForm();
    const textarea = await fillCardList('Lightning Bolt');

    fireEvent.keyDown(textarea, { key: 'Enter' });

    expect(onAddCards).not.toHaveBeenCalled();
  });
});

describe('quantities', () => {
  const submitCardList = async (cardList: string) => {
    await user.click(screen.getByLabelText('card list'));
    const textarea = screen.getByPlaceholderText<HTMLTextAreaElement>(/colossal dreadmaw/i);
    fireEvent.change(textarea, { target: { value: cardList } });
    await user.click(screen.getByRole('button', { name: 'Add cards' }));
    return textarea;
  };

  test('adds as many copies as the quantity of each line in the list', async () => {
    const onAddCards = setupForm();

    await submitCardList('2 Lightning Bolt\n3x Counterspell\n1X Colossal Dreadmaw\nIsland');

    expect(onAddCards).toHaveBeenCalledWith([
      'Lightning Bolt', 'Lightning Bolt',
      'Counterspell', 'Counterspell', 'Counterspell',
      'Colossal Dreadmaw',
      'Island',
    ]);
  });

  test('treats numbers too big to be a quantity as part of the card name', async () => {
    const onAddCards = setupForm();

    await submitCardList('1996 World Champion\n2 1996 World Champion');

    expect(onAddCards).toHaveBeenCalledWith([
      '1996 World Champion',
      '1996 World Champion', '1996 World Champion',
    ]);
  });

  test('rejects a list with a quantity of 0 without adding or clearing it', async () => {
    const onAddCards = setupForm();

    const textarea = await submitCardList('Island\n0 Lightning Bolt');

    expect(onAddCards).not.toHaveBeenCalled();
    expect(textarea).toHaveValue('Island\n0 Lightning Bolt');
    expect(textarea.validationMessage).toBe('"0 Lightning Bolt": the quantity must be between 1 and 100');
  });

  test('editing the list clears the quantity error', async () => {
    setupForm();
    const textarea = await submitCardList('0 Lightning Bolt');

    fireEvent.input(textarea, { target: { value: '1 Lightning Bolt' } });

    expect(textarea.validationMessage).toBe('');
  });
});
