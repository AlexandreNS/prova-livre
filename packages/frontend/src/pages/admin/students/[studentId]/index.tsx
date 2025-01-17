import type { StudentGetSchema } from '@prova-livre/shared/dtos/admin/student/student.dto';
import type { SchemaRoute } from '@prova-livre/shared/types/schema.type';

import ListGroup from '@prova-livre/frontend/components/ListGroup';
import NoPermission from '@prova-livre/frontend/components/NoPermission';
import State from '@prova-livre/frontend/components/State';
import useAdminAuth from '@prova-livre/frontend/hooks/useAdminAuth';
import useIdParam from '@prova-livre/frontend/hooks/useIdParam';
import useRequest from '@prova-livre/frontend/hooks/useRequest';
import { hasPermissionList } from '@prova-livre/shared/helpers/feature.helper';

export default function Page() {
  const { user } = useAdminAuth();
  const studentId = useIdParam('studentId');

  const [hasReadPermission] = hasPermissionList(user?.role, 'Student-Read');

  const { data: student, state } = useRequest<SchemaRoute<typeof StudentGetSchema>>(
    hasReadPermission && studentId && `/students/${studentId}`,
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
            { label: 'ID', value: student?.id },
            'break',
            { label: 'Nome', value: student?.name },
            'break',
            { label: 'E-mail', value: student?.email },
          ]}
        />
      </State>
    </>
  );
}
