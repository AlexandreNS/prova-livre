import { Outlet } from 'react-router-dom';

import NoPermission from '@prova-livre/frontend/components/NoPermission';
import PageHeader from '@prova-livre/frontend/components/PageHeader';
import useAdminAuth from '@prova-livre/frontend/hooks/useAdminAuth';
import useIdParam from '@prova-livre/frontend/hooks/useIdParam';
import { hasPermissionList } from '@prova-livre/shared/helpers/feature.helper';

export default function Layout() {
  const { user } = useAdminAuth();
  const examId = useIdParam('examId');

  const [hasReadPermission, hasWritePermission] = hasPermissionList(user?.role, 'Exam-Read', 'Exam-Write');

  if (!hasReadPermission) {
    return <NoPermission />;
  }
  return (
    <>
      <PageHeader
        title={`${examId ? 'Editar' : 'Adicionar'} Prova`}
        tabs={[
          hasReadPermission && examId ? { value: '', label: 'Resumo' } : null,
          hasWritePermission && { value: 'basic', label: 'Dados' },
          hasWritePermission && { value: 'questions', label: 'Questões', disabled: !examId },
        ]}
      />

      <Outlet />
    </>
  );
}
