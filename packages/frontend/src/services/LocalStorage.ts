import { MODULE } from '@prova-livre/frontend/constants/module.constant';

const LocalStorage = {
  clear(allKeys = false) {
    if (allKeys) {
      return localStorage.clear();
    }

    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(MODULE)) {
        localStorage.removeItem(key);
      }
    });
  },

  remove(key: string) {
    key = `${MODULE}.${key}`;
    localStorage.removeItem(key);
  },

  set(key: string, value?: any) {
    key = `${MODULE}.${key}`;
    localStorage.setItem(key, JSON.stringify({ value }));
  },

  get<Type = any>(key: string, defaultValue?: Type): Type | undefined {
    try {
      key = `${MODULE}.${key}`;

      if (key in localStorage) {
        const item = localStorage.getItem(key);
        const json = JSON.parse(item ?? '');
        return json?.value ?? defaultValue;
      }
    } catch {}

    return defaultValue;
  },
};

export default LocalStorage;
