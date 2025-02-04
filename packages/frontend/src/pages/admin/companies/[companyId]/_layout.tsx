import type { CompanyGetSchema } from '@prova-livre/shared/dtos/admin/company/company.dto';
import type { SchemaRoute } from '@prova-livre/shared/types/schema.type';

import { Outlet } from 'react-router-dom';

import PageHeader from '@prova-livre/frontend/components/PageHeader';
import useIdParam from '@prova-livre/frontend/hooks/useIdParam';
import useRequest from '@prova-livre/frontend/hooks/useRequest';
import { hasPermission } from '@prova-livre/shared/helpers/feature.helper';

export default function Layout() {
  const companyId = useIdParam('companyId');

  const { data: company } = useRequest<SchemaRoute<typeof CompanyGetSchema>>(companyId && `/companies/${companyId}`, {
    noCache: true,
    autoRevalidate: false,
  });

  const hasWritePermission = hasPermission(company?.role, 'Company-Write');

  return (
    <>
      <PageHeader
        title={`${companyId ? 'Editar' : 'Adicionar'} Instituição`}
        tabs={[
          companyId ? { value: '', label: 'Resumo' } : null,
          hasWritePermission ? { value: 'basic', label: 'Dados' } : null,
          hasWritePermission && companyId ? { value: 'users', label: 'Usuários' } : null,
        ]}
      />

      <Outlet />
    </>
  );
}
