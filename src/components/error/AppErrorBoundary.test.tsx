import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AppErrorBoundary from './AppErrorBoundary';
import { saveToStorage } from '../../utils/storage';

const Broken = () => {
  throw new Error('Unreadable data');
};

beforeEach(() => {
  // React logs the errors boundaries catch
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.stubGlobal('location', { ...window.location, reload: vi.fn() });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  localStorage.clear();
});

test('shows the app while it works', () => {
  render(
    <AppErrorBoundary>
      <p>The press</p>
    </AppErrorBoundary>,
  );

  expect(screen.getByText('The press')).toBeInTheDocument();
});

test('offers to reload, or to reset the saved data, when the app breaks', async () => {
  saveToStorage('localStorage', 'press:SETTINGS@1', { cardVariant: 'realistic' });
  render(
    <AppErrorBoundary>
      <Broken />
    </AppErrorBoundary>,
  );

  expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong');
  await userEvent.click(screen.getByRole('button', { name: 'Reload' }));
  expect(localStorage.getItem('press:SETTINGS')).not.toBeNull();

  await userEvent.click(screen.getByRole('button', { name: 'Reset and reload' }));
  expect(localStorage.getItem('press:SETTINGS')).toBeNull();
  expect(window.location.reload).toHaveBeenCalledTimes(2);
});
