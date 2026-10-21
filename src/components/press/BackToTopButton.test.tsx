import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import BackToTopButton from './BackToTopButton';

let reportVisibility: (isVisible: boolean) => void;

beforeEach(() => {
  vi.stubGlobal(
    'IntersectionObserver',
    vi.fn(function (callback: (entries: { isIntersecting: boolean }[]) => void) {
      reportVisibility = (isVisible) => callback([{ isIntersecting: isVisible }]);
      return { observe: vi.fn(), disconnect: vi.fn() };
    }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const renderButton = () => {
  const watched = createRef<HTMLDivElement>();
  render(
    <>
      <div ref={watched} />
      <BackToTopButton watched={watched} />
    </>,
  );
};

test('is hidden while the watched element is in view', () => {
  renderButton();

  act(() => reportVisibility(true));

  expect(screen.queryByRole('button', { name: 'Back to top' })).not.toBeInTheDocument();
});

test('shows once the watched element is scrolled away, and scrolls back to the top', async () => {
  const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  renderButton();

  act(() => reportVisibility(false));
  await userEvent.click(screen.getByRole('button', { name: 'Back to top' }));

  expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  scrollTo.mockRestore();
});
