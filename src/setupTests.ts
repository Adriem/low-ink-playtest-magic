import '@testing-library/jest-dom/vitest';

// jsdom has no IntersectionObserver: one that never reports anything, which tests can replace
globalThis.IntersectionObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
} as unknown as typeof IntersectionObserver;
