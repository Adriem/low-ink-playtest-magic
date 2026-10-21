import { render, screen } from '@testing-library/react';
import SiteFooter from './SiteFooter';

test('shows the copyright notice of the current year', () => {
  render(<SiteFooter />);

  expect(screen.getByText(`© ${new Date().getFullYear()} Adrian Moreno`)).toBeInTheDocument();
});

test('links to reporting an issue on GitHub, in a new tab', () => {
  render(<SiteFooter />);

  const link = screen.getByRole('link', { name: 'Report here' });
  expect(link).toHaveAttribute('href', 'https://github.com/Adriem/low-ink-mtg-press/issues/new');
  expect(link).toHaveAttribute('target', '_blank');
});
