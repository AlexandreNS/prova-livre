import type { SchemaQueryParams, SchemaRoute } from '@prova-livre/shared/types/schema.type';

import { useDependentState } from 'react-state-hooks';

import Html from '@prova-livre/frontend/components/Html';
import ListGroup from '@prova-livre/frontend/components/ListGroup';
import NoPermission from '@prova-livre/frontend/components/NoPermission';
import Pagination from '@prova-livre/frontend/components/Pagination';
import State from '@prova-livre/frontend/components/State';
import useAdminAuth from '@prova-livre/frontend/hooks/useAdminAuth';
import useIdParam from '@prova-livre/frontend/hooks/useIdParam';
import useRequest from '@prova-livre/frontend/hooks/useRequest';
import { ClassGetSchema } from '@prova-livre/shared/dtos/admin/class/class.dto';
import { StudentListSchema } from '@prova-livre/shared/dtos/admin/student/student.dto';
import { hasPermissionList } from '@prova-livre/shared/helpers/feature.helper';
import { number } from '@prova-livre/shared/helpers/number.helper';
import { Text } from '@react-bulk/web';

export default function Page() {
  const { user } = useAdminAuth();
  const classId = useIdParam('classId');
  const [studentsParams, setStudentsParams] = useDependentState<SchemaQueryParams<typeof StudentListSchema>>(
    () => ({
      page: 1,
      classId: number(classId),
    }),
    [classId],
  );

  const [hasReadPermission] = hasPermissionList(user?.role, 'Class-Read');

  const { data: classData, state: classState } = useRequest<SchemaRoute<typeof ClassGetSchema>>(
    hasReadPermission && classId && `/classes/${classId}`,
  );

  const { data: students, state: studentsState } = useRequest<SchemaRoute<typeof StudentListSchema>>(
    hasReadPermission && classId && `/students`,
    { params: studentsParams },
  );

  if (!hasReadPermission) {
    return <NoPermission />;
  }

  return (
    <>
      <State {...classState}>
        <ListGroup
          mt="1gap"
          data={[
            { label: 'Nome', value: classData?.name },
            'break',
            { label: 'Descrição', value: <Html html={classData?.description} /> },
          ]}
        />

        <Text mt="2gap" variant="subtitle">
          Estudantes
        </Text>
        <State {...studentsState}>
          <ListGroup
            mt="1gap"
            data={students?.rows
              ?.map((student) => [
                {
                  xs: 12,
                  md: 'auto',
                  value: <Text variant="secondary">#{student.id}</Text>,
                },
                {
                  xs: 12,
                  md: 'auto',
                  value: <Text>{student.name || '[sem nome]'}</Text>,
                },
                {
                  xs: 12,
                  md: 'flex',
                  value: <Text variant="secondary">{`<${student.email}>`}</Text>,
                },
                'break',
              ])
              .flat()
              .slice(0, -1)}
          />

          <Pagination
            {...students}
            plural="estudantes"
            singular="estudante"
            onChange={(data) => setStudentsParams((current) => ({ ...current, ...data }))}
          />
        </State>
      </State>
    </>
  );
}
