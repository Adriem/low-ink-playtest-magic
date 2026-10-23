import { render, screen } from '@testing-library/react';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import Icon from './Icon';

test('draws the icon as an SVG hidden from screen readers, in the color of the text', () => {
  render(
    <button type="button">
      <Icon icon={faTrash} /> Delete
    </button>,
  );

  // eslint-disable-next-line testing-library/no-node-access -- the icon is hidden from the accessibility tree
  const svg = screen.getByRole('button', { name: 'Delete' }).querySelector('svg');
  expect(svg).toHaveAttribute('aria-hidden', 'true');
  expect(svg).toHaveAttribute('viewBox', `0 0 ${faTrash.icon[0]} ${faTrash.icon[1]}`);
  // eslint-disable-next-line testing-library/no-node-access -- the icon is hidden from the accessibility tree
  expect(svg?.querySelector('path')).toHaveAttribute('fill', 'currentColor');
});
