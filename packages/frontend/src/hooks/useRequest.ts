import type { AnyObject } from '@react-bulk/core';
import type { AxiosRequestConfig, Method } from 'axios';

import { useMemo } from 'react';

import { MODULE } from '@prova-livre/frontend/constants/module.constant';
import { type ApiInstance, addQueryParam } from '@prova-livre/frontend/helpers/api.helper';
import ApiAdmin from '@prova-livre/frontend/services/ApiAdmin';
import ApiStudent from '@prova-livre/frontend/services/ApiStudent';
import useSWR, { type SWRConfiguration, useSWRConfig } from 'swr';

export type UseRequestOptions<Params = any> = {
  api?: ApiInstance;
  autoFetch?: boolean;
  autoFetchInterval?: number;
  autoRevalidate?: boolean;
  method?: Method;
  noCache?: boolean;
  params?: Params;
  retryOnError?: boolean;
} & Pick<AxiosRequestConfig, 'headers'> &
  Pick<SWRConfiguration, 'fetcher'>;

export default function useRequest<T extends AnyObject>(
  key: 0 | false | null | string | undefined,
  {
    api = MODULE === 'admin' ? ApiAdmin : ApiStudent,
    autoFetch = true,
    autoFetchInterval,
    autoRevalidate = true,
    fetcher,
    headers,
    method = 'GET',
    noCache,
    params,
    retryOnError = true,
  }: UseRequestOptions<T['Querystring']> = {},
) {
  const { cache } = useSWRConfig();

  let url: string;

  if (key) {
    if (params) {
      key = addQueryParam(key, params);
    }

    url = key;
    key = `${MODULE}.${key}`;
  }

  if (!fetcher) {
    fetcher = () => api.request({ headers, method, url }).then(({ data }) => data);
  }

  useMemo(() => {
    if (key && noCache) {
      cache.delete(key);
    }
  }, [key, cache, noCache]);

  const request = useSWR<T['Response']>(key || null, fetcher, {
    dedupingInterval: noCache ? 0 : 10000,
    focusThrottleInterval: noCache ? 0 : 10000,
    refreshInterval: autoFetchInterval,
    revalidateIfStale: autoFetch,
    revalidateOnFocus: autoRevalidate,
    revalidateOnMount: autoFetch,
    revalidateOnReconnect: autoRevalidate,
    shouldRetryOnError: retryOnError,
  });

  return useMemo(
    () => ({
      data: request.data,
      error: request.error,
      isLoading: request.isLoading,
      isValidating: request.isValidating,
      mutate: (data: ((prev: T['Response']) => Promise<T['Response']> | T['Response']) | T['Response']) =>
        request.mutate(data as any, { revalidate: false }),
      revalidate: () => request.mutate(),

      state: {
        error: request.error,
        loading: request.isLoading,
        onRefresh: () => request.mutate(),
        empty: request.data?.rows
          ? !request.data?.rows?.length
          : Array.isArray(request.data)
            ? !request.data?.length
            : !request.data,
      },
    }),
    [request],
  );
}
