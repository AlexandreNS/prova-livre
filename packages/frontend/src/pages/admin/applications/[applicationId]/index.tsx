import type { SchemaRoute } from '@prova-livre/shared/types/schema.type';

import ListGroup from '@prova-livre/frontend/components/ListGroup';
import NoPermission from '@prova-livre/frontend/components/NoPermission';
import State from '@prova-livre/frontend/components/State';
import useAdminAuth from '@prova-livre/frontend/hooks/useAdminAuth';
import useIdParam from '@prova-livre/frontend/hooks/useIdParam';
import useRequest from '@prova-livre/frontend/hooks/useRequest';
import { ApplicationGetSchema } from '@prova-livre/shared/dtos/admin/application/application.dto';
import { format } from '@prova-livre/shared/helpers/date.helper';
import { hasPermissionList } from '@prova-livre/shared/helpers/feature.helper';

export default function Page() {
  const { user } = useAdminAuth();
  const applicationId = useIdParam('applicationId');

  const [hasReadPermission] = hasPermissionList(user?.role, 'Application-Read');

  const { data: application, state } = useRequest<SchemaRoute<typeof ApplicationGetSchema>>(
    hasReadPermission && applicationId && `/applications/${applicationId}`,
  );

  if (!hasReadPermission) {
    return <NoPermission />;
  }

  return (
    <>
      <State {...state}>
        <ListGroup
          mt="1gap"
          data={[
            { label: 'ID da Prova', value: application?.exam?.id, xs: 12, md: 'auto' },
            { label: 'Prova', value: application?.exam?.name, xs: 12, md: 'flex' },
            'break',
            { label: 'Início', value: format(application?.startedAt, true), xs: 12, md: 'flex' },
            { label: 'Término', value: format(application?.endedAt, true), xs: 12, md: 'flex' },
            'break',
            { label: 'Número de Tentativas', value: application?.attempts, xs: 12, md: 'flex' },
            { label: 'Temporizador (em minutos)', value: application?.limitTime ?? '-', xs: 12, md: 'flex' },
          ]}
        />

        <ListGroup
          mt="1gap"
          data={[
            {
              label: 'Avaliados podem visualizar o gabarito após a correção',
              value: application?.showAnswers,
              xs: 12,
            },
            {
              label: 'Avaliados podem visualizar a nota de cada questão após a correção',
              value: application?.showScores,
              xs: 12,
            },
            {
              label: 'Avaliados podem enviar o feedback de prova',
              value: application?.allowFeedback,
              xs: 12,
            },
          ]}
        />
      </State>
    </>
  );
}
