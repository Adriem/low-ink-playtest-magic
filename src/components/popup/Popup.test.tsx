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

test('closes with Escape, unless it is not dismissible', () => {
  const { rerender } = render(<Popup>Content</Popup>);
  const escape = () => {
    const cancel = new Event('cancel', { cancelable: true });
    fireEvent(screen.getByRole('dialog', { hidden: true }), cancel);
    return cancel;
  };

  expect(escape().defaultPrevented).toBe(false);

  rerender(<Popup dismissible={false}>Content</Popup>);

  expect(escape().defaultPrevented).toBe(true);
});

test('does not close when clicking around it, if it is not dismissible', () => {
  render(<Popup dismissible={false}>Content</Popup>);
  const dialog = screen.getByRole('dialog', { hidden: true }) as HTMLDialogElement;
  dialog.close = vi.fn();
  dialog.getBoundingClientRect = () => ({ left: 100, right: 300, top: 100, bottom: 300 }) as DOMRect;

  fireEvent.click(dialog, { clientX: 50, clientY: 200 });

  expect(dialog.close).not.toHaveBeenCalled();
});

test('passes other props to the dialog, e.g. what it is labelled by', () => {
  render(
    <Popup aria-labelledby="popup-title">
      <h2 id="popup-title">Terms</h2>
    </Popup>,
  );

  // Only open dialogs are found, with their name: Popup doesn't open itself
  (screen.getByRole('dialog', { hidden: true }) as HTMLDialogElement).showModal();

  expect(screen.getByRole('dialog', { name: 'Terms' })).toBeInTheDocument();
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

test('calls its own click and cancel handlers too', () => {
  const onClick = vi.fn();
  const onCancel = vi.fn();
  render(
    <Popup onClick={onClick} onCancel={onCancel}>
      Content
    </Popup>,
  );
  const dialog = screen.getByRole('dialog', { hidden: true });

  fireEvent.click(dialog);
  fireEvent(dialog, new Event('cancel', { cancelable: true }));

  expect(onClick).toHaveBeenCalled();
  expect(onCancel).toHaveBeenCalled();
});
