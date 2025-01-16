import type { AnyObject } from '@react-bulk/core';

import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

import { parseParams } from '@prova-livre/frontend/helpers/api.helper';

export default function useQueryParams<T extends AnyObject>(initialParams?: T) {
  const [_query, _setQuery] = useSearchParams(initialParams);

  const updateQuery = useCallback(
    (query: AnyObject) => {
      _setQuery((current) => {
        return parseParams({ ...Object.fromEntries(current), ...query });
      });
    },
    [_setQuery],
  );

  return [Object.fromEntries(_query) as T, updateQuery] as const;
}
