import { Outlet } from 'react-router-dom';

import PageHeader from '@prova-livre/frontend/components/PageHeader';
import useAdminAuth from '@prova-livre/frontend/hooks/useAdminAuth';
import useIdParam from '@prova-livre/frontend/hooks/useIdParam';
import { hasPermissionList } from '@prova-livre/shared/helpers/feature.helper';

export default function Layout() {
  const { user } = useAdminAuth();
  const studentId = useIdParam('studentId');

  const [hasReadPermission, hasWritePermission] = hasPermissionList(user?.role, 'Student-Read', 'Student-Write');

  return (
    <>
      <PageHeader
        title={`${studentId ? 'Editar' : 'Adicionar'} Estudante`}
        tabs={[
          hasReadPermission && studentId ? { value: '', label: 'Resumo' } : null,
          hasWritePermission && { value: 'basic', label: 'Dados' },
        ]}
      />

      <Outlet />
    </>
  );
}
