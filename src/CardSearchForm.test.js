import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CardSearchForm from './CardSearchForm';

const setupForm = () => {
  const onAddCards = jest.fn();
  render(<CardSearchForm onAddCards={onAddCards} />);
  return onAddCards;
};

test('adds a single card by name', () => {
  const onAddCards = setupForm();

  userEvent.type(screen.getByPlaceholderText(/colossal dreadmaw/i), '  Lightning Bolt ');
  userEvent.click(screen.getByRole('button', { name: 'Add card' }));

  expect(onAddCards).toHaveBeenCalledWith(['Lightning Bolt']);
});

test('clears the card name after adding it', () => {
  setupForm();
  const input = screen.getByPlaceholderText(/colossal dreadmaw/i);

  userEvent.type(input, 'Lightning Bolt');
  userEvent.click(screen.getByRole('button', { name: 'Add card' }));

  expect(input).toHaveValue('');
});

test('does not add anything for an empty name', () => {
  const onAddCards = setupForm();

  userEvent.click(screen.getByRole('button', { name: 'Add card' }));

  expect(onAddCards).not.toHaveBeenCalled();
});

test('adds a list of cards in order, ignoring empty lines', () => {
  const onAddCards = setupForm();

  userEvent.click(screen.getByLabelText('card list'));
  fireEvent.change(screen.getByPlaceholderText(/colossal dreadmaw/i), {
    target: { value: 'Lightning Bolt\n\nCounterspell\n  Island  \n' },
  });
  userEvent.click(screen.getByRole('button', { name: 'Add cards' }));

  expect(onAddCards).toHaveBeenCalledWith(['Lightning Bolt', 'Counterspell', 'Island']);
});

test('clears the card list after adding it', () => {
  setupForm();

  userEvent.click(screen.getByLabelText('card list'));
  const textarea = screen.getByPlaceholderText(/colossal dreadmaw/i);
  fireEvent.change(textarea, { target: { value: 'Lightning Bolt\nCounterspell' } });
  userEvent.click(screen.getByRole('button', { name: 'Add cards' }));

  expect(textarea).toHaveValue('');
});

test('switches between single card and card list modes', () => {
  setupForm();

  expect(screen.getByLabelText('single card')).toBeChecked();
  expect(screen.getByRole('button', { name: 'Add card' })).toBeInTheDocument();

  userEvent.click(screen.getByLabelText('card list'));
  expect(screen.getByLabelText('card list')).toBeChecked();
  expect(screen.getByRole('button', { name: 'Add cards' })).toBeInTheDocument();

  userEvent.click(screen.getByLabelText('single card'));
  expect(screen.getByRole('button', { name: 'Add card' })).toBeInTheDocument();
});

describe('card list shortcut', () => {
  const fillCardList = (cardList) => {
    userEvent.click(screen.getByLabelText('card list'));
    const textarea = screen.getByPlaceholderText(/colossal dreadmaw/i);
    fireEvent.change(textarea, { target: { value: cardList } });
    return textarea;
  };

  test('submits the list with Ctrl+Enter', () => {
    const onAddCards = setupForm();
    const textarea = fillCardList('Lightning Bolt\nCounterspell');

    fireEvent.keyDown(textarea, { key: 'Enter', ctrlKey: true });

    expect(onAddCards).toHaveBeenCalledWith(['Lightning Bolt', 'Counterspell']);
    expect(textarea).toHaveValue('');
  });

  test('submits the list with Cmd+Enter', () => {
    const onAddCards = setupForm();
    const textarea = fillCardList('Lightning Bolt');

    fireEvent.keyDown(textarea, { key: 'Enter', metaKey: true });

    expect(onAddCards).toHaveBeenCalledWith(['Lightning Bolt']);
  });

  test('does not submit the list with Enter alone', () => {
    const onAddCards = setupForm();
    const textarea = fillCardList('Lightning Bolt');

    fireEvent.keyDown(textarea, { key: 'Enter' });

    expect(onAddCards).not.toHaveBeenCalled();
  });
});

describe('quantities', () => {
  const submitCardList = (cardList) => {
    userEvent.click(screen.getByLabelText('card list'));
    const textarea = screen.getByPlaceholderText(/colossal dreadmaw/i);
    fireEvent.change(textarea, { target: { value: cardList } });
    userEvent.click(screen.getByRole('button', { name: 'Add cards' }));
    return textarea;
  };

  test('adds as many copies as the quantity of each line in the list', () => {
    const onAddCards = setupForm();

    submitCardList('2 Lightning Bolt\n3x Counterspell\n1X Colossal Dreadmaw\nIsland');

    expect(onAddCards).toHaveBeenCalledWith([
      'Lightning Bolt', 'Lightning Bolt',
      'Counterspell', 'Counterspell', 'Counterspell',
      'Colossal Dreadmaw',
      'Island',
    ]);
  });

  test('treats numbers too big to be a quantity as part of the card name', () => {
    const onAddCards = setupForm();

    submitCardList('1996 World Champion\n2 1996 World Champion');

    expect(onAddCards).toHaveBeenCalledWith([
      '1996 World Champion',
      '1996 World Champion', '1996 World Champion',
    ]);
  });

  test('rejects a list with a quantity of 0 without adding or clearing it', () => {
    const onAddCards = setupForm();

    const textarea = submitCardList('Island\n0 Lightning Bolt');

    expect(onAddCards).not.toHaveBeenCalled();
    expect(textarea).toHaveValue('Island\n0 Lightning Bolt');
    expect(textarea.validationMessage).toBe('"0 Lightning Bolt": the quantity must be between 1 and 100');
  });

  test('editing the list clears the quantity error', () => {
    setupForm();
    const textarea = submitCardList('0 Lightning Bolt');

    fireEvent.input(textarea, { target: { value: '1 Lightning Bolt' } });

    expect(textarea.validationMessage).toBe('');
  });
});
