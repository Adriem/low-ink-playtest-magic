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

test('closes with its close button, when it has one', () => {
  const { rerender } = render(<Popup>Content</Popup>);

  expect(screen.queryByRole('button', { name: 'Close', hidden: true })).not.toBeInTheDocument();

  rerender(<Popup hasCloseButton>Content</Popup>);
  const dialog = screen.getByRole('dialog', { hidden: true }) as HTMLDialogElement;
  dialog.close = vi.fn();
  fireEvent.click(screen.getByRole('button', { name: 'Close', hidden: true }));

  expect(dialog.close).toHaveBeenCalled();
});

test('has a back button only with a function to call with it', () => {
  const onBack = vi.fn();
  const { rerender } = render(<Popup>Content</Popup>);

  expect(screen.queryByRole('button', { name: '← Back', hidden: true })).not.toBeInTheDocument();

  rerender(<Popup onBack={onBack}>Content</Popup>);
  fireEvent.click(screen.getByRole('button', { name: '← Back', hidden: true }));

  expect(onBack).toHaveBeenCalled();
});
