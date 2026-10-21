import '@testing-library/jest-dom/vitest';
// The texts of the app, as it renders them
import './i18n';

// jsdom has no IntersectionObserver: one that never reports anything, which tests can replace
globalThis.IntersectionObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
} as unknown as typeof IntersectionObserver;
