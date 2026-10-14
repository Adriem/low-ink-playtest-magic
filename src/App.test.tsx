import { render, screen } from '@testing-library/react';
import App from './App';

vi.mock('jspdf', () => ({ jsPDF: vi.fn() }));
vi.mock('./utils/scryfall', () => ({
  fetchCardData: vi.fn(),
  fetchSymbology: vi.fn(() => Promise.resolve({ data: [] })),
}));

test('renders the card search form', () => {
  render(<App />);
  expect(screen.getByPlaceholderText(/colossal dreadmaw/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Add card' })).toBeInTheDocument();
});
