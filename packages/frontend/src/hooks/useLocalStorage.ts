import { useCallback, useEffect, useMemo } from 'react';
import { useStoreState } from 'react-state-hooks';

import LocalStorage from '@prova-livre/frontend/services/LocalStorage';

export default function useLocalStorage<T>(key: string, initialValue?: T) {
  const [state, _setState] = useStoreState<T>(`storage.${key}`, LocalStorage.get(key) ?? initialValue);

  const setState: typeof _setState = useCallback(
    (value) => {
      _setState((current) => {
        const next = value instanceof Function ? value(current) : value;
        LocalStorage.set(key, next);
        return next;
      });
    },
    [key, _setState],
  );

  useEffect(() => {
    const value = LocalStorage.get<T>(key);

    if (typeof value !== 'undefined') {
      _setState(value);
    }
  }, [key, _setState]);

  return useMemo(() => [state, setState] as const, [setState, state]);
}
