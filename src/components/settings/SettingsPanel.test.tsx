import { fireEvent, render, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import SettingsPanel from './SettingsPanel';
import { SettingsContextProvider } from './SettingsContext';

let user: UserEvent;

afterEach(() => sessionStorage.clear());

beforeEach(() => {
  user = userEvent.setup();
});

test('shows a group of options for each setting, with the defaults selected', () => {
  renderPanel();

  expect(screen.getByRole('group', { name: 'Card style', hidden: true })).toBeInTheDocument();
  expect(screen.getByLabelText('Realistic')).toBeChecked();
  expect(screen.getByRole('group', { name: 'Split card treatment', hidden: true })).toBeInTheDocument();
  expect(screen.getByRole('group', { name: 'Double-Faced card treatment', hidden: true })).toBeInTheDocument();
  expect(screen.getByLabelText('Low')).toBeChecked();
});

test('changes and saves a setting', async () => {
  renderPanel();

  await user.click(screen.getByLabelText('Minimalist'));

  expect(screen.getByLabelText('Minimalist')).toBeChecked();
  expect(sessionStorage.getItem('press:cardVariant')).toBe('"minimalist"');
});

test('picks the ink level', async () => {
  renderPanel();

  await user.click(screen.getByLabelText('High'));

  expect(screen.getByLabelText('High')).toBeChecked();
  expect(sessionStorage.getItem('press:inkLevel')).toBe('"high"');

  await user.click(screen.getByLabelText('Splurge'));

  expect(screen.getByLabelText('Splurge')).toBeChecked();
  expect(sessionStorage.getItem('press:inkLevel')).toBe('"splurge"');
});

test('picks the art fidelity with a slider through its options, showing the one picked', () => {
  renderPanel();
  const slider = screen.getByRole('slider', { name: 'Art fidelity', hidden: true });

  expect(slider).toHaveValue('1');
  expect(slider).toHaveAttribute('aria-valuetext', 'Minimal');

  fireEvent.change(slider, { target: { value: '2' } });

  expect(slider).toHaveAttribute('aria-valuetext', 'Black & white');
  expect(screen.getByText('Black & white')).toBeInTheDocument();
  expect(sessionStorage.getItem('press:artFidelity')).toBe('"black-and-white"');

  fireEvent.change(slider, { target: { value: '0' } });

  expect(sessionStorage.getItem('press:artFidelity')).toBe('"none"');
});

const renderPanel = () => {
  return render(
    <SettingsContextProvider>
      <SettingsPanel />
    </SettingsContextProvider>,
  );
};
