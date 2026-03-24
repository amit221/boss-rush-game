/** In-memory localStorage for Node/Jest */
export function installMemoryLocalStorage() {
  const store = new Map();
  const ls = {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
    removeItem(key) {
      store.delete(key);
    },
    clear() {
      store.clear();
    },
  };
  global.localStorage = ls;
  return ls;
}
