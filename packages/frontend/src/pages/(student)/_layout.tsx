import { Outlet, useLocation } from 'react-router-dom';

import StudentHeader from '@prova-livre/frontend/components/StudentHeader';
import { LayoutProvider } from '@prova-livre/frontend/contexts/LayoutContext';
import { StudentAuthProvider } from '@prova-livre/frontend/contexts/StudentAuthContext';
import useParams from '@prova-livre/frontend/hooks/useParams';
import useStudentAuth from '@prova-livre/frontend/hooks/useStudentAuth';
import { Navigate } from '@prova-livre/frontend/router';
import { number } from '@prova-livre/shared/helpers/number.helper';
import { Box, Scrollable } from '@react-bulk/web';

function StudentLayout() {
  const { status } = useStudentAuth();
  const { pathname } = useLocation();
  const { showHeader = 1 } = useParams();

  const publics = ['/login', '/forgot-password', '/reset-password'];

  if (publics.includes(pathname)) {
    return <Outlet />;
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/login" />;
  }

  return (
    <LayoutProvider>
      {Boolean(number(showHeader)) && <StudentHeader />}

      <Box flex noWrap row>
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
    <StudentAuthProvider>
      <StudentLayout />
    </StudentAuthProvider>
  );
}
