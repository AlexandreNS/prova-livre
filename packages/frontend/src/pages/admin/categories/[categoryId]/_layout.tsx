import { Outlet } from 'react-router-dom';

import NoPermission from '@prova-livre/frontend/components/NoPermission';
import PageHeader from '@prova-livre/frontend/components/PageHeader';
import useAdminAuth from '@prova-livre/frontend/hooks/useAdminAuth';
import useIdParam from '@prova-livre/frontend/hooks/useIdParam';
import { hasPermissionList } from '@prova-livre/shared/helpers/feature.helper';

export default function Layout() {
  const { user } = useAdminAuth();
  const categoryId = useIdParam('categoryId');

  const [hasReadPermission, hasWritePermission] = hasPermissionList(user?.role, 'Category-Read', 'Category-Write');

  if (!hasReadPermission) {
    return <NoPermission />;
  }

  return (
    <>
      <PageHeader
        title={`${categoryId ? 'Editar' : 'Adicionar'} Categoria`}
        tabs={[
          hasReadPermission && categoryId ? { value: '', label: 'Resumo' } : null,
          hasWritePermission && { value: 'basic', label: 'Dados' },
          hasWritePermission && { value: 'subcategories', label: 'Subcategorias', disabled: !categoryId },
        ]}
      />

      <Outlet />
    </>
  );
}
