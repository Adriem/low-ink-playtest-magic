import { clearSavedData, loadFromStorage, saveToStorage } from './storage';

afterEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
  sessionStorage.clear();
});

test('loads the values it saved', () => {
  saveToStorage('localStorage', 'press:TEST@1', { a: 1 });

  expect(loadFromStorage('localStorage', 'press:TEST@1', {})).toEqual({ a: 1 });
});

test("saves under the key without its version, so a new version replaces the old one's data", () => {
  saveToStorage('localStorage', 'press:TEST@1', { a: 1 });
  saveToStorage('localStorage', 'press:TEST@2', { b: 2 });

  expect(Object.keys(localStorage)).toEqual(['press:TEST']);
  expect(JSON.parse(localStorage.getItem('press:TEST')!)).toEqual({ version: 2, data: { b: 2 } });
});

test('drops data saved with another version of its shape, or without one', () => {
  saveToStorage('localStorage', 'press:OLD@1', { a: 1 });
  localStorage.setItem('press:UNVERSIONED', JSON.stringify({ a: 1 }));

  expect(loadFromStorage('localStorage', 'press:OLD@2', 'fallback')).toBe('fallback');
  expect(loadFromStorage('localStorage', 'press:UNVERSIONED@1', 'fallback')).toBe('fallback');
  expect(localStorage.getItem('press:OLD')).toBeNull();
  expect(localStorage.getItem('press:UNVERSIONED')).toBeNull();
});

test('drops data that is not valid', () => {
  saveToStorage('sessionStorage', 'press:TEST@1', 'not a list');

  expect(loadFromStorage('sessionStorage', 'press:TEST@1', [], Array.isArray)).toEqual([]);
});

test('works without storage, e.g. with site data blocked or storage full', () => {
  vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => {
    throw new DOMException('The operation is insecure.', 'SecurityError');
  });
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new DOMException('Quota exceeded', 'QuotaExceededError');
  });

  expect(() => saveToStorage('localStorage', 'press:TEST@1', 1)).not.toThrow();
  expect(() => saveToStorage('sessionStorage', 'press:TEST@1', 1)).not.toThrow();
  expect(loadFromStorage('localStorage', 'press:TEST@1', 'fallback')).toBe('fallback');
});

test("clears the app's data, leaving other sites' alone", () => {
  saveToStorage('localStorage', 'press:SETTINGS@1', {});
  saveToStorage('sessionStorage', 'press:CARD_COLLECTION@1', []);
  localStorage.setItem('other-site', 'kept');

  clearSavedData();

  expect([localStorage.getItem('press:SETTINGS'), sessionStorage.getItem('press:CARD_COLLECTION')]).toEqual([
    null,
    null,
  ]);
  expect(localStorage.getItem('other-site')).toBe('kept');
});
