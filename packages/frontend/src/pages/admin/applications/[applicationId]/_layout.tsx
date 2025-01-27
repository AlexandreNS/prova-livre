import { Outlet } from 'react-router-dom';

import NoPermission from '@prova-livre/frontend/components/NoPermission';
import PageHeader from '@prova-livre/frontend/components/PageHeader';
import useAdminAuth from '@prova-livre/frontend/hooks/useAdminAuth';
import useIdParam from '@prova-livre/frontend/hooks/useIdParam';
import { hasPermissionList } from '@prova-livre/shared/helpers/feature.helper';

export default function Layout() {
  const { user } = useAdminAuth();
  const applicationId = useIdParam('applicationId');

  const [hasReadPermission, hasWritePermission] = hasPermissionList(
    user?.role,
    'Application-Read',
    'Application-Write',
  );

  if (!hasReadPermission) {
    return <NoPermission />;
  }

  return (
    <>
      <PageHeader
        title={`${applicationId ? 'Editar' : 'Adicionar'} Aplicação de Prova`}
        tabs={[
          hasReadPermission && applicationId ? { value: '', label: 'Resumo' } : null,
          hasWritePermission && { value: 'basic', label: 'Dados' },
          hasReadPermission && { value: 'classes', label: 'Turmas', disabled: !applicationId },
          hasReadPermission && { value: 'students', label: 'Avaliados', disabled: !applicationId },
        ]}
      />

      <Outlet />
    </>
  );
}
