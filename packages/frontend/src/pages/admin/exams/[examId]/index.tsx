import type { SchemaRoute } from '@prova-livre/shared/types/schema.type';

import Html from '@prova-livre/frontend/components/Html';
import ListGroup from '@prova-livre/frontend/components/ListGroup';
import NoPermission from '@prova-livre/frontend/components/NoPermission';
import State from '@prova-livre/frontend/components/State';
import useAdminAuth from '@prova-livre/frontend/hooks/useAdminAuth';
import useIdParam from '@prova-livre/frontend/hooks/useIdParam';
import useRequest from '@prova-livre/frontend/hooks/useRequest';
import { ExamGetSchema } from '@prova-livre/shared/dtos/admin/exam/exam.dto';
import { hasPermissionList } from '@prova-livre/shared/helpers/feature.helper';

export default function Page() {
  const { user } = useAdminAuth();
  const examId = useIdParam('examId');

  const [hasReadPermission] = hasPermissionList(user?.role, 'Exam-Read');

  const { data: exam, state } = useRequest<SchemaRoute<typeof ExamGetSchema>>(
    hasReadPermission && examId && `/exams/${examId}`,
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
            { label: 'Nome', value: exam?.title, xs: 12, md: 'flex' },
            { label: 'Pontuação Máxima', value: exam?.maxScore, xs: 12, md: 'flex' },
            { label: 'Pontuação Mínima para Aprovação', value: exam?.minScore, xs: 12, md: 'flex' },
            'break',
            { label: 'Descrição', value: <Html html={exam?.description} />, xs: 12 },
          ]}
        />
      </State>
    </>
  );
}
