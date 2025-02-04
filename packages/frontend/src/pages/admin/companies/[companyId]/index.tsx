import type { SchemaRoute } from '@prova-livre/shared/types/schema.type';

import ListGroup from '@prova-livre/frontend/components/ListGroup';
import State from '@prova-livre/frontend/components/State';
import useIdParam from '@prova-livre/frontend/hooks/useIdParam';
import useRequest from '@prova-livre/frontend/hooks/useRequest';
import { type CompanyGetSchema } from '@prova-livre/shared/dtos/admin/company/company.dto';

export default function Page() {
  const companyId = useIdParam('companyId');

  const { data: company, state } = useRequest<SchemaRoute<typeof CompanyGetSchema>>(
    companyId && `/companies/${companyId}`,
    {
      noCache: true,
      autoRevalidate: false,
    },
  );

  return (
    <>
      <State {...state}>
        <ListGroup data={[{ label: 'Nome da Instituição', value: company?.name }]} mt="1gap" />
      </State>
    </>
  );
}
