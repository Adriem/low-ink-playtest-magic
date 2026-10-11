import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('jspdf', () => ({ jsPDF: jest.fn() }));
jest.mock('./utils/scryfall', () => ({
  fetchCardData: jest.fn(),
  fetchSymbology: jest.fn(() => Promise.resolve({ data: [] })),
}));

test('renders the card search form', () => {
  render(<App />);
  expect(screen.getByPlaceholderText(/colossal dreadmaw/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Add card' })).toBeInTheDocument();
});
