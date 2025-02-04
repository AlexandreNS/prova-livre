import { Outlet } from 'react-router-dom';

import PageHeader from '@prova-livre/frontend/components/PageHeader';
import useAdminAuth from '@prova-livre/frontend/hooks/useAdminAuth';
import useIdParam from '@prova-livre/frontend/hooks/useIdParam';
import { hasPermissionList } from '@prova-livre/shared/helpers/feature.helper';

export default function Layout() {
  const { user } = useAdminAuth();
  const classId = useIdParam('classId');

  const [hasReadPermission, hasWritePermission] = hasPermissionList(user?.role, 'Class-Read', 'Class-Write');

  return (
    <>
      <PageHeader
        title={`${classId ? 'Editar' : 'Adicionar'} Turma`}
        tabs={[
          hasReadPermission && classId ? { value: '', label: 'Resumo' } : null,
          hasWritePermission && { value: 'basic', label: 'Dados' },
          hasWritePermission && classId ? { value: 'students', label: 'Estudantes' } : null,
        ]}
      />

      <Outlet />
    </>
  );
}
