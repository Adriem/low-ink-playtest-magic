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

  expect(slider).toHaveValue('3');
  expect(slider).toHaveAttribute('aria-valuetext', '4');

  fireEvent.change(slider, { target: { value: '1' } });

  expect(slider).toHaveAttribute('aria-valuetext', '2');
  expect(getSavedSettings().artFidelity).toBe('contours');

  fireEvent.change(slider, { target: { value: '0' } });

  expect(getSavedSettings().artFidelity).toBe('blank');
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
