import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SettingsContextProvider } from '../settings';
import PressActions from './PressActions';

// jsdom has no modal dialogs, so opening one only shows it
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () {
    this.open = true;
  };
});

afterAll(() => {
  delete (HTMLDialogElement.prototype as Partial<HTMLDialogElement>).showModal;
});

test('clears and exports the press', async () => {
  const user = userEvent.setup();
  const onClear = vi.fn();
  const onExport = vi.fn();
  renderActions({ onClear, onExport });

  await user.click(screen.getByRole('button', { name: 'Clear' }));
  expect(onClear).toHaveBeenCalledTimes(1);

  await user.click(screen.getByRole('button', { name: 'EXPORT' }));
  expect(onExport).toHaveBeenCalledTimes(1);
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
