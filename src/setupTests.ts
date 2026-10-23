import '@testing-library/jest-dom/vitest';
import { initialiseTestConfig } from './configTests';
import { resetFlag } from './testUtils';
import './i18n';

initialiseTestConfig();

afterEach(() => {
  resetFlag();
});

// jsdom has no IntersectionObserver: one that never reports anything, which tests can replace
globalThis.IntersectionObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
} as unknown as typeof IntersectionObserver;
