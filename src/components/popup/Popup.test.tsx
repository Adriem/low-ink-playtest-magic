import { fireEvent, render, screen } from '@testing-library/react';
import Popup from './Popup';

test('closes when clicking on the overlay around it, but not inside it', () => {
  render(
    <Popup>
      <button type="button">Inside</button>
    </Popup>,
  );
  const dialog = screen.getByRole('dialog', { hidden: true }) as HTMLDialogElement;
  dialog.close = vi.fn();
  dialog.getBoundingClientRect = () => ({ left: 100, right: 300, top: 100, bottom: 300 }) as DOMRect;

  fireEvent.click(dialog, { clientX: 200, clientY: 200 });
  fireEvent.click(screen.getByRole('button', { name: 'Inside', hidden: true }));

  expect(dialog.close).not.toHaveBeenCalled();

  fireEvent.click(dialog, { clientX: 50, clientY: 200 });

  expect(dialog.close).toHaveBeenCalled();
});
