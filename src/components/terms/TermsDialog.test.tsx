import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TermsDialog from './TermsDialog';
import { overrideFlag } from '../../testUtils';

beforeEach(() => {
  overrideFlag('TERMS_DIALOG', true);
});

afterEach(() => {
  localStorage.clear();
});

test('asks to agree to the terms, continuing only once agreed', async () => {
  render(<TermsDialog />);
  const continueButton = screen.getByRole('button', { name: 'Continue' });

  expect(screen.getByRole('dialog', { name: 'Before you start' })).toBeInTheDocument();
  expect(screen.getByText(/for your personal use only/)).toBeInTheDocument();
  expect(continueButton).toBeDisabled();

  await userEvent.click(screen.getByLabelText('I understand and agree'));
  await userEvent.click(continueButton);

  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

test('does not ask again once agreed', async () => {
  const { unmount } = render(<TermsDialog />);
  await userEvent.click(screen.getByLabelText('I understand and agree'));
  await userEvent.click(screen.getByRole('button', { name: 'Continue' }));
  unmount();

  render(<TermsDialog />);

  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

test('does not close with Escape, nor by clicking around it', () => {
  render(<TermsDialog />);
  const dialog = screen.getByRole('dialog');

  const cancel = new Event('cancel', { cancelable: true });
  fireEvent(dialog, cancel);

  expect(cancel.defaultPrevented).toBe(true);

  (dialog as HTMLDialogElement).close = vi.fn();
  dialog.getBoundingClientRect = () => ({ left: 100, right: 300, top: 100, bottom: 300 }) as DOMRect;
  fireEvent.click(dialog, { clientX: 50, clientY: 200 });

  expect((dialog as HTMLDialogElement).close).not.toHaveBeenCalled();
});

test('follows its flag, e.g. turned off from the console', () => {
  render(<TermsDialog />);

  act(() => {
    window.flags.TERMS_DIALOG = false;
  });

  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});
