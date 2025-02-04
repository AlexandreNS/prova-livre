import { Outlet } from 'react-router-dom';

import useAdminAuth from '@prova-livre/frontend/hooks/useAdminAuth';
import { Navigate } from '@prova-livre/frontend/router';

export default function Layout() {
  const { user } = useAdminAuth();

  if (user?.role !== 'su') {
    return <Navigate replace to="/admin" />;
  }

  return <Outlet />;
}
