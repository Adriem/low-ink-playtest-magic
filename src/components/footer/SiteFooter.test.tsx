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

test('links to the license of the code and to its source, in new tabs', () => {
  render(<SiteFooter />);

  expect(screen.getByRole('link', { name: 'GNU AGPL v3' })).toHaveAttribute(
    'href',
    'https://www.gnu.org/licenses/agpl-3.0.html',
  );
  const source = screen.getByRole('link', { name: 'Source code' });
  expect(source).toHaveAttribute('href', 'https://github.com/Adriem/low-ink-mtg-press');
  expect(source).toHaveAttribute('target', '_blank');
});

test('links to reporting an issue on GitHub, in a new tab', () => {
  render(<SiteFooter />);

  const link = screen.getByRole('link', { name: 'Report here' });
  expect(link).toHaveAttribute('href', 'https://github.com/Adriem/low-ink-mtg-press/issues/new');
  expect(link).toHaveAttribute('target', '_blank');
});
