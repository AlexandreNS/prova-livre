import { Outlet, useLocation } from 'react-router-dom';

import AdminHeader from '@prova-livre/frontend/components/AdminHeader';
import AdminSidebar from '@prova-livre/frontend/components/AdminSidebar';
import { AdminAuthProvider } from '@prova-livre/frontend/contexts/AdminAuthContext';
import { LayoutProvider } from '@prova-livre/frontend/contexts/LayoutContext';
import useAdminAuth from '@prova-livre/frontend/hooks/useAdminAuth';
import useParams from '@prova-livre/frontend/hooks/useParams';
import { Navigate } from '@prova-livre/frontend/router';
import { number } from '@prova-livre/shared/helpers/number.helper';
import { Box, Scrollable } from '@react-bulk/web';

function AdminLayout() {
  const { status } = useAdminAuth();
  const { pathname } = useLocation();
  const { showHeader = 1 } = useParams();

  const publics = ['/admin/login', '/admin/forgot-password', '/admin/reset-password'];

  if (publics.includes(pathname)) {
    return <Outlet />;
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/admin/login" />;
  }

  return (
    <LayoutProvider>
      {Boolean(number(showHeader)) && <AdminHeader />}

      <Box flex noWrap row>
        {Boolean(number(showHeader)) && (
          <Box>
            <AdminSidebar />
          </Box>
        )}
        <Box flex>
          <Scrollable component="main" contentInset="1gap">
            <Outlet />
          </Scrollable>
        </Box>
      </Box>
    </LayoutProvider>
  );
}

export default function Provider() {
  return (
    <AdminAuthProvider>
      <AdminLayout />
    </AdminAuthProvider>
  );
}
