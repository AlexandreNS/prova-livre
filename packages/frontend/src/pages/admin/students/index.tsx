import type { StudentListSchema } from '@prova-livre/shared/dtos/admin/student/student.dto';
import type { SchemaQueryParams, SchemaRoute } from '@prova-livre/shared/types/schema.type';

import React from 'react';

import Icon from '@prova-livre/frontend/components/Icon';
import LinkChild from '@prova-livre/frontend/components/LinkChild';
import ListGroup from '@prova-livre/frontend/components/ListGroup';
import NoPermission from '@prova-livre/frontend/components/NoPermission';
import PageHeader from '@prova-livre/frontend/components/PageHeader';
import Pagination from '@prova-livre/frontend/components/Pagination';
import State from '@prova-livre/frontend/components/State';
import { confirm } from '@prova-livre/frontend/helpers/alert.helper';
import { getError } from '@prova-livre/frontend/helpers/api.helper';
import useAdminAuth from '@prova-livre/frontend/hooks/useAdminAuth';
import useQueryParams from '@prova-livre/frontend/hooks/useQueryParams';
import useRequest from '@prova-livre/frontend/hooks/useRequest';
import ApiAdmin from '@prova-livre/frontend/services/ApiAdmin';
import { format } from '@prova-livre/shared/helpers/date.helper';
import { hasPermissionList } from '@prova-livre/shared/helpers/feature.helper';
import { type RbkPointerEvent, useToaster } from '@react-bulk/core';
import { Box, Button, Tooltip } from '@react-bulk/web';

export default function Page() {
  const { user } = useAdminAuth();
  const toaster = useToaster();

  const [hasReadPermission, hasWritePermission, hasDeletePermission] = hasPermissionList(
    user?.role,
    'Student-Read',
    'Student-Write',
    'Student-Delete',
  );

  const [params, updateParams] = useQueryParams<SchemaQueryParams<typeof StudentListSchema>>({
    page: 1,
  });

  const {
    data: students,
    revalidate: revalidateStudents,
    state,
  } = useRequest<SchemaRoute<typeof StudentListSchema>>(hasReadPermission && '/students', { params });

  const handleDeleteStudent = async (_: RbkPointerEvent, studentId: number) => {
    if (!confirm('Deseja remover permanentemente o estudante?')) {
      return;
    }

    try {
      await ApiAdmin.delete(`/students/${studentId}`);
      await revalidateStudents();
    } catch (err) {
      toaster.error(getError(err));
    }
  };

  if (!hasReadPermission) {
    return <NoPermission />;
  }

  return (
    <>
      <PageHeader title="Estudantes" onSearch={(search) => updateParams({ search })}>
        {hasWritePermission && (
          <LinkChild href="/admin/students/add/basic">
            <Button>Adicionar</Button>
          </LinkChild>
        )}
      </PageHeader>

      <State {...state}>
        {students?.rows?.map((student) => (
          <ListGroup
            key={student.id}
            mt="1gap"
            data={[
              {
                minw: 100,
                label: 'ID',
                value: student.id,
              },
              {
                xs: 12,
                md: 6,
                label: 'Último Acesso',
                value: student.accessedAt ? format(student.accessedAt, true) : 'Nunca',
              },
              'break',
              {
                xs: 12,
                md: 'flex',
                label: 'Nome',
                value: student.name || '[sem nome]',
              },
              {
                xs: 12,
                md: 'flex',
                label: 'E-mail',
                value: student.email,
              },
            ]}
            right={
              <Box m="-0.5gap">
                <Tooltip title="Ver">
                  <LinkChild href={`/admin/students/${student.id}`}>
                    <Button
                      circular
                      startAddon={({ color }) => <Icon color={color} name="CaretRight" />}
                      variant="text"
                    />
                  </LinkChild>
                </Tooltip>
                {hasWritePermission && (
                  <Tooltip title="Editar">
                    <LinkChild href={`/admin/students/${student.id}/basic`}>
                      <Button
                        circular
                        startAddon={({ color }) => <Icon color={color} name="Pencil" />}
                        variant="text"
                      />
                    </LinkChild>
                  </Tooltip>
                )}
                {hasDeletePermission && (
                  <Tooltip title="Remover">
                    <Button
                      circular
                      color="error"
                      startAddon={({ color }) => <Icon color={color} name="Trash" />}
                      variant="text"
                      onPress={(e) => handleDeleteStudent(e, student.id)}
                    />
                  </Tooltip>
                )}
              </Box>
            }
          />
        ))}

        <Pagination {...students} onChange={updateParams} />
      </State>
    </>
  );
}
