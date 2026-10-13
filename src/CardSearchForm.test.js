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

test('does not add anything for an empty name', () => {
  const onAddCards = setupForm();

  userEvent.click(screen.getByRole('button', { name: 'Add card' }));

  expect(onAddCards).not.toHaveBeenCalled();
});

test('adds a list of cards in order, ignoring quantities and empty lines', () => {
  const onAddCards = setupForm();

  userEvent.click(screen.getByLabelText('card list'));
  fireEvent.change(screen.getByPlaceholderText(/colossal dreadmaw/i), {
    target: { value: '4 Lightning Bolt\n\nCounterspell\n  Island  \n' },
  });
  userEvent.click(screen.getByRole('button', { name: 'Add cards' }));

  expect(onAddCards).toHaveBeenCalledWith(['Lightning Bolt', 'Counterspell', 'Island']);
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
