import { render, screen } from '@testing-library/react';
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

test('disables settings that are not available yet', () => {
  renderPanel();

  expect(screen.getByLabelText('Medium')).toBeDisabled();
});

const renderPanel = () => {
  return render(
    <SettingsContextProvider>
      <SettingsPanel />
    </SettingsContextProvider>,
  );
};
