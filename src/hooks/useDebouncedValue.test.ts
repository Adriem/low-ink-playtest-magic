import { act, renderHook } from '@testing-library/react';
import { useDebouncedValue } from './useDebouncedValue';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

test('follows the value once it stops changing for the delay', () => {
  const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 500), {
    initialProps: { value: 'h' },
  });

  rerender({ value: 'ht' });
  act(() => vi.advanceTimersByTime(400));
  rerender({ value: 'htt' });
  act(() => vi.advanceTimersByTime(400));

  expect(result.current).toBe('h');

  act(() => vi.advanceTimersByTime(100));

  expect(result.current).toBe('htt');
});
