import { act, renderHook } from '@testing-library/react';
import { useFlag } from './useFlag';
import type { Flag } from '../utils/flags';
import { overrideFlag, resetFlag } from '../testUtils';

// Only in tests (see configTests)
const testFlag = 'TEST_FLAG' as Flag;

test('re-renders when the flag changes, e.g. from the console', () => {
  const { result } = renderHook(() => useFlag(testFlag));
  expect(result.current).toBe(false);

  act(() => {
    overrideFlag(testFlag, true);
  });

  expect(result.current).toBe(true);
});

test('stops listening to the flags once unmounted', () => {
  let hookCalls = 0;
  const { unmount } = renderHook(() => {
    hookCalls++;
    return useFlag(testFlag);
  });
  const hookCallsBeforeUnmount = hookCalls;

  unmount();
  act(() => {
    overrideFlag(testFlag, true);
  });

  expect(hookCalls).toBe(hookCallsBeforeUnmount);
});

test('starts each test with the flags off, whatever the tests before turned on', () => {
  expect(window.flags[testFlag]).toBe(false);
});

test('turns overridden flags back off', () => {
  overrideFlag(testFlag, true);
  resetFlag(testFlag);

  expect(window.flags[testFlag]).toBe(false);
});
