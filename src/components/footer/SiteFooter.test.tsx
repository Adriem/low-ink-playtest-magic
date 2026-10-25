import { render, screen } from '@testing-library/react';
import SiteFooter from './SiteFooter';

test('shows the copyright notice of the current year, for everything but the cards', () => {
  render(<SiteFooter />);

  expect(
    screen.getByText(`Everything else, including the code, © ${new Date().getFullYear()} Adrian Moreno.`),
  ).toBeInTheDocument();
});

test('says the cards belong to Wizards of the Coast', () => {
  render(<SiteFooter />);

  expect(
    screen.getByText(/not affiliated with, endorsed, sponsored or approved by Wizards of the Coast/),
  ).toBeInTheDocument();
});

test('links to reporting an issue on GitHub, in a new tab', () => {
  render(<SiteFooter />);

  const link = screen.getByRole('link', { name: 'Report here' });
  expect(link).toHaveAttribute('href', 'https://github.com/Adriem/low-ink-mtg-press/issues/new');
  expect(link).toHaveAttribute('target', '_blank');
});
