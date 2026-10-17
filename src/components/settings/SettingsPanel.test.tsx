import { fireEvent, render, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import SettingsPanel from './SettingsPanel';
import { SettingsContextProvider } from './SettingsContext';

let user: UserEvent;

afterEach(() => localStorage.clear());

beforeEach(() => {
  user = userEvent.setup();
});

test('shows a group of options for each setting, with the defaults selected', () => {
  renderPanel();

  expect(screen.getByRole('group', { name: 'Card style', hidden: true })).toBeInTheDocument();
  expect(screen.getByLabelText('Realistic')).toBeChecked();
  expect(screen.getByRole('group', { name: 'Split card treatment', hidden: true })).toBeInTheDocument();
  expect(screen.getByRole('group', { name: 'Double-Faced card treatment', hidden: true })).toBeInTheDocument();
  expect(screen.getByLabelText('Medium')).toBeChecked();
});

test('changes and saves a setting', async () => {
  renderPanel();

  await user.click(screen.getByLabelText('Minimalist'));

  expect(screen.getByLabelText('Minimalist')).toBeChecked();
  expect(getSavedSettings().cardVariant).toBe('minimalist');
});

test('picks the ink level', async () => {
  renderPanel();

  await user.click(screen.getByLabelText('High'));

  expect(screen.getByLabelText('High')).toBeChecked();
  expect(getSavedSettings().inkLevel).toBe('high');

  await user.click(screen.getByLabelText('Splurge'));

  expect(screen.getByLabelText('Splurge')).toBeChecked();
  expect(getSavedSettings().inkLevel).toBe('splurge');
});

test('picks the art fidelity with a slider through its levels', () => {
  renderPanel();
  const slider = screen.getByRole('slider', { name: 'Art fidelity', hidden: true });

  expect(slider).toHaveValue('2');
  expect(slider).toHaveAttribute('aria-valuetext', '3');

  fireEvent.change(slider, { target: { value: '3' } });

  expect(slider).toHaveAttribute('aria-valuetext', '4');
  expect(getSavedSettings().artFidelity).toBe('black-and-white');

  fireEvent.change(slider, { target: { value: '0' } });

  expect(getSavedSettings().artFidelity).toBe('none');
});

test('disables the art fidelity for the minimalist style, which has no art', async () => {
  renderPanel();

  await user.click(screen.getByLabelText('Minimalist'));

  expect(screen.getByRole('slider', { name: 'Art fidelity', hidden: true })).toBeDisabled();

  await user.click(screen.getByLabelText('Realistic'));

  expect(screen.getByRole('slider', { name: 'Art fidelity', hidden: true })).toBeEnabled();
});

test('loads the saved settings, with the defaults for missing and unknown values', () => {
  localStorage.setItem('press:settings', JSON.stringify({ cardVariant: 'minimalist', inkLevel: 'unknown' }));

  renderPanel();

  expect(screen.getByLabelText('Minimalist')).toBeChecked();
  expect(screen.getByLabelText('Medium')).toBeChecked();
});

test('closes when clicking on the overlay around it, but not inside it', () => {
  renderPanel();
  const dialog = screen.getByRole('dialog', { hidden: true }) as HTMLDialogElement;
  dialog.close = vi.fn();
  dialog.getBoundingClientRect = () => ({ left: 100, right: 300, top: 100, bottom: 300 }) as DOMRect;

  fireEvent.click(dialog, { clientX: 200, clientY: 200 });
  fireEvent.click(screen.getByLabelText('Minimalist'));

  expect(dialog.close).not.toHaveBeenCalled();

  fireEvent.click(dialog, { clientX: 50, clientY: 200 });

  expect(dialog.close).toHaveBeenCalled();
});

const getSavedSettings = () => {
  return JSON.parse(localStorage.getItem('press:settings') ?? '{}');
};

const renderPanel = () => {
  return render(
    <SettingsContextProvider>
      <SettingsPanel />
    </SettingsContextProvider>,
  );
};
