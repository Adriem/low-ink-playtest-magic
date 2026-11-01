import '@testing-library/jest-dom/vitest';
import { initialiseTestConfig } from './configTests';
import { resetFlag } from './testUtils';
import './i18n';

initialiseTestConfig();

afterEach(() => {
  resetFlag();
});

// jsdom has no modal dialogs: opening one only shows it (its open attribute, which jsdom's styles show it by), and
// closing it hides it and says so, as browsers do
HTMLDialogElement.prototype.showModal ??= function (this: HTMLDialogElement) {
  this.open = true;
};
HTMLDialogElement.prototype.close ??= function (this: HTMLDialogElement) {
  if (!this.open) return;
  this.open = false;
  this.dispatchEvent(new Event('close'));
};

// jsdom has no IntersectionObserver: one that never reports anything, which tests can replace
globalThis.IntersectionObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
} as unknown as typeof IntersectionObserver;
