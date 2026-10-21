import { render, screen } from '@testing-library/react';
import App from './App';

vi.mock('jspdf', () => ({ jsPDF: vi.fn() }));
vi.mock('./adapters/scryfall', () => ({
  fetchCard: vi.fn(),
  getSymbolImage: vi.fn(() => Promise.resolve(undefined)),
}));

test('renders the footer, with where to report issues', () => {
  render(<App />);
  expect(screen.getByRole('link', { name: 'Report here' })).toBeInTheDocument();
});

test('renders the card search form', () => {
  render(<App />);
  expect(screen.getByPlaceholderText(/colossal dreadmaw/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Add card' })).toBeInTheDocument();
});
