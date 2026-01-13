
// A simple in-memory storage mock for environments where localStorage is not available.
const memoryStore: { [key: string]: string } = {};

const createInMemoryStorage = (): Storage => ({
  getItem: (key: string): string | null => memoryStore[key] || null,
  setItem: (key: string, value: string): void => {
    memoryStore[key] = String(value);
  },
  removeItem: (key: string): void => {
    delete memoryStore[key];
  },
  clear: (): void => {
    for (const key in memoryStore) {
      if (Object.prototype.hasOwnProperty.call(memoryStore, key)) {
        delete memoryStore[key];
      }
    }
  },
  key: (index: number): string | null => Object.keys(memoryStore)[index] || null,
  get length(): number {
    return Object.keys(memoryStore).length;
  },
});

const getSafeLocalStorage = (): Storage => {
  try {
    // Try to access localStorage. This will throw an error in some environments.
    const storage = window.localStorage;
    // Test if storage is actually usable
    const testKey = '__test_local_storage__';
    storage.setItem(testKey, testKey);
    storage.removeItem(testKey);
    return storage;
  } catch (e) {
    // If it fails, return the in-memory fallback.
    console.warn("localStorage is not available. Falling back to in-memory storage. User settings will not be saved across sessions.");
    return createInMemoryStorage();
  }
};

export const safeStorage = getSafeLocalStorage();
