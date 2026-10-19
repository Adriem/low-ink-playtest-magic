import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SettingsContextProvider } from '../settings';
import PressActions from './PressActions';

// jsdom has no modal dialogs, so opening one only shows it, and closing it hides it
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function () {
    this.open = false;
  };
});

afterEach(() => localStorage.clear());

afterAll(() => {
  delete (HTMLDialogElement.prototype as Partial<HTMLDialogElement>).showModal;
  delete (HTMLDialogElement.prototype as Partial<HTMLDialogElement>).close;
});

test('clears the press, and exports it with the options asked for in a popup', async () => {
  const user = userEvent.setup();
  const onClear = vi.fn();
  const onExport = vi.fn();
  renderActions({ onClear, onExport });

  await user.click(screen.getByRole('button', { name: 'Clear' }));
  expect(onClear).toHaveBeenCalledTimes(1);

  await user.click(screen.getByRole('button', { name: 'EXPORT' }));
  expect(onExport).not.toHaveBeenCalled();
  expect(screen.getByRole('group', { name: 'Page size' })).toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: 'Export' }));
  expect(onExport).toHaveBeenCalledWith({ pageSize: 'a4', fileName: 'mtg-playtest-press' });
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

test('opens the settings', async () => {
  const user = userEvent.setup();
  renderActions();

  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: 'Settings' }));

  expect(screen.getByRole('dialog')).toBeInTheDocument();
  expect(screen.getByRole('group', { name: 'Card style' })).toBeInTheDocument();
});

const renderActions = ({ onClear = vi.fn(), onExport = vi.fn() } = {}) => {
  return render(
    <SettingsContextProvider>
      <PressActions onClear={onClear} onExport={onExport} />
    </SettingsContextProvider>,
  );
};
