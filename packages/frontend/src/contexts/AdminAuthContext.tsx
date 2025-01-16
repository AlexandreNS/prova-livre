import type { SchemaRoute } from '@prova-livre/shared/types/schema.type';
import type { ReactElement } from '@react-bulk/core';

import { type Dispatch, type SetStateAction, createContext, useEffect, useMemo } from 'react';

import { MODULE } from '@prova-livre/frontend/constants/module.constant';
import useLocalStorage from '@prova-livre/frontend/hooks/useLocalStorage';
import useRequest from '@prova-livre/frontend/hooks/useRequest';
import ApiAdmin from '@prova-livre/frontend/services/ApiAdmin';
import LocalStorage from '@prova-livre/frontend/services/LocalStorage';
import { AuthMeSchema } from '@prova-livre/shared/dtos/admin/auth/auth.dto';
import { Loading } from '@react-bulk/web';
import { mutate } from 'swr';

import useQueryParams from '../hooks/useQueryParams';

export type AdminAuthStatus = 'authenticated' | 'loading' | 'unauthenticated';

export type AdminAuthUser = {
  company?: AdminAuthCompany;
  email: string;
  id: number;
  name: string;
  role?: 'admin' | 'owner' | 'su' | 'tutor'; // TODO: type
};

export type AdminAuthCompany = {
  id: number;
  name: string;
};

export const AdminAuthContext = createContext<{
  company: AdminAuthCompany | null;
  login: (username: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  setToken: Dispatch<SetStateAction<null | string>>;
  status: AdminAuthStatus;
  token: null | string;
  user: AdminAuthUser | null;
}>(null as any);

export function AdminAuthProvider({ children }: { children?: ReactElement }) {
  const [params, updateParams] = useQueryParams<{
    token?: string;
  }>();

  const [token, setToken] = useLocalStorage<null | string>('token', null);

  const {
    data: user = null,
    isLoading: isLoadingUser,
    revalidate: revalidateMe,
  } = useRequest<SchemaRoute<typeof AuthMeSchema>>(token && '/auth/me', {
    noCache: true,
    autoRevalidate: false,
    retryOnError: false,
  });

  const company = user?.company ?? null;

  const status: AdminAuthStatus = useMemo(
    () => (isLoadingUser || params.token ? 'loading' : token && user ? 'authenticated' : 'unauthenticated'),
    [isLoadingUser, params.token, token, user],
  );

  useEffect(() => {
    if (!params.token) return;
    setToken(params.token);
    updateParams({ token: undefined });
  }, [params.token, setToken, updateParams]);

  async function login(email: string, password: string) {
    const response = await ApiAdmin.post('/auth', {
      email,
      password,
    });

    setToken(response?.data?.token || null);
    await revalidateMe();
  }

  async function logout() {
    const lastLogin = LocalStorage.get('lastLogin');

    // SWR: clear cache
    await mutate((key) => typeof key === 'string' && key.startsWith(MODULE), undefined, { revalidate: false });

    LocalStorage.clear();
    LocalStorage.set('lastLogin', lastLogin);

    setToken(null);
  }

  return (
    <AdminAuthContext.Provider value={{ login, logout, status, token, setToken, user, company }}>
      {status === 'loading' ? <Loading flex bg="primary" color="white" /> : children}
    </AdminAuthContext.Provider>
  );
}
