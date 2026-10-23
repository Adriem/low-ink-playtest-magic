import { render, screen } from '@testing-library/react';
import SiteHeader from './SiteHeader';

test("shows the site's name as the page's heading", () => {
  render(<SiteHeader />);

  expect(screen.getByRole('heading', { level: 1, name: 'Low-ink Playtest Magic' })).toBeInTheDocument();
});
