import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SettingsContextProvider } from '../settings';
import PressActions from './PressActions';

afterEach(() => localStorage.clear());

test('clears the press once confirmed', async () => {
  const user = userEvent.setup();
  const onClear = vi.fn();
  renderActions({ onClear });

  await user.click(screen.getByRole('button', { name: 'Clear' }));
  expect(onClear).not.toHaveBeenCalled();
  await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Cancel' }));
  expect(onClear).not.toHaveBeenCalled();
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: 'Clear' }));
  expect(screen.getByRole('dialog')).toHaveTextContent('Clear the press?');
  await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Clear' }));
  expect(onClear).toHaveBeenCalledTimes(1);
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

test('exports the press with the options asked for in a popup, saying how to print it', async () => {
  const user = userEvent.setup();
  const onExport = vi.fn();
  renderActions({ onExport });

  await user.click(screen.getByRole('button', { name: 'Export' }));
  expect(onExport).not.toHaveBeenCalled();
  expect(screen.getByRole('group', { name: 'Page size' })).toBeInTheDocument();
  expect(screen.getByRole('dialog', { name: 'Export' })).toHaveTextContent('actual size (100%)');

  await user.click(within(screen.getByRole('dialog', { name: 'Export' })).getByRole('button', { name: 'Export' }));
  expect(onExport).toHaveBeenCalledWith({ pageSize: 'a4', fileName: 'mtg-playtest-press' });
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

test('says it is exporting, and does not export again meanwhile', () => {
  renderActions({ canExport: false, isExporting: true });

  expect(screen.getByRole('button', { name: 'Exporting…' })).toBeDisabled();
});

test('opens the settings', async () => {
  const user = userEvent.setup();
  renderActions();

  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: 'Settings' }));

  expect(screen.getByRole('dialog', { name: 'Settings' })).toBeInTheDocument();
  expect(screen.getByRole('group', { name: 'Card style' })).toBeInTheDocument();
});

const renderActions = ({ canExport = true, isExporting = false, onClear = vi.fn(), onExport = vi.fn() } = {}) => {
  return render(
    <SettingsContextProvider>
      <PressActions canExport={canExport} isExporting={isExporting} onClear={onClear} onExport={onExport} />
    </SettingsContextProvider>,
  );
};
