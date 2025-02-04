import { Outlet } from 'react-router-dom';

import PageHeader from '@prova-livre/frontend/components/PageHeader';
import useAdminAuth from '@prova-livre/frontend/hooks/useAdminAuth';
import useIdParam from '@prova-livre/frontend/hooks/useIdParam';
import { hasPermissionList } from '@prova-livre/shared/helpers/feature.helper';

export default function Layout() {
  const { user } = useAdminAuth();
  const userId = useIdParam('userId');

  const [hasReadPermission, hasWritePermission] = hasPermissionList(user?.role, 'User-Read', 'User-Write');

  return (
    <>
      <PageHeader
        title={`${userId ? 'Editar' : 'Adicionar'} Usuário`}
        tabs={[
          hasReadPermission && userId ? { value: '', label: 'Resumo' } : null,
          hasWritePermission && { value: 'basic', label: 'Dados' },
        ]}
      />

      <Outlet />
    </>
  );
}
