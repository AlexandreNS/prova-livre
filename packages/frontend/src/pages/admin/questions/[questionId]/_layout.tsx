import { Outlet } from 'react-router-dom';

import NoPermission from '@prova-livre/frontend/components/NoPermission';
import PageHeader from '@prova-livre/frontend/components/PageHeader';
import useAdminAuth from '@prova-livre/frontend/hooks/useAdminAuth';
import useIdParam from '@prova-livre/frontend/hooks/useIdParam';
import { hasPermissionList } from '@prova-livre/shared/helpers/feature.helper';

export default function Layout() {
  const { user } = useAdminAuth();
  const questionId = useIdParam('questionId');

  const [hasReadPermission, hasWritePermission] = hasPermissionList(user?.role, 'Question-Read', 'Question-Write');

  if (!hasReadPermission) {
    return <NoPermission />;
  }

  return (
    <>
      <PageHeader
        title={`${questionId ? 'Editar' : 'Adicionar'} Questão`}
        tabs={[
          hasReadPermission && questionId ? { value: '', label: 'Resumo' } : null,
          hasWritePermission && { value: 'basic', label: 'Dados' },
          hasWritePermission && { value: 'options', label: 'Opções', disabled: !questionId },
          hasWritePermission && { value: 'categories', label: 'Categorias', disabled: !questionId },
        ]}
      />

      <Outlet />
    </>
  );
}
