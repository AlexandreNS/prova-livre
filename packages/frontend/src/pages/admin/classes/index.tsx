import type { ClassListSchema } from '@prova-livre/shared/dtos/admin/class/class.dto';
import type { SchemaQueryParams, SchemaRoute } from '@prova-livre/shared/types/schema.type';

import React from 'react';

import Icon from '@prova-livre/frontend/components/Icon';
import LinkChild from '@prova-livre/frontend/components/LinkChild';
import ListGroup from '@prova-livre/frontend/components/ListGroup';
import NoPermission from '@prova-livre/frontend/components/NoPermission';
import PageHeader from '@prova-livre/frontend/components/PageHeader';
import Pagination from '@prova-livre/frontend/components/Pagination';
import State from '@prova-livre/frontend/components/State';
import { getError } from '@prova-livre/frontend/helpers/api.helper';
import useAdminAuth from '@prova-livre/frontend/hooks/useAdminAuth';
import useQueryParams from '@prova-livre/frontend/hooks/useQueryParams';
import useRequest from '@prova-livre/frontend/hooks/useRequest';
import ApiAdmin from '@prova-livre/frontend/services/ApiAdmin';
import { hasPermissionList } from '@prova-livre/shared/helpers/feature.helper';
import { type RbkPointerEvent, useToaster } from '@react-bulk/core';
import { Box, Button, Tooltip } from '@react-bulk/web';

export default function Page() {
  const { user } = useAdminAuth();
  const toaster = useToaster();

  const [hasReadPermission, hasWritePermission, hasDeletePermission] = hasPermissionList(
    user?.role,
    'Class-Read',
    'Class-Write',
    'Class-Delete',
  );

  const [params, updateParams] = useQueryParams<SchemaQueryParams<typeof ClassListSchema>>({
    page: 1,
  });

  const {
    data: classes,
    revalidate: revalidateClass,
    state,
  } = useRequest<SchemaRoute<typeof ClassListSchema>>(hasReadPermission && '/classes', {
    params,
  });

  if (!hasReadPermission) {
    return <NoPermission />;
  }

  const handleDeleteClass = async (_: RbkPointerEvent, classId: number) => {
    if (!confirm('Deseja remover permanentemente a turma?')) {
      return;
    }

    try {
      await ApiAdmin.delete(`/classes/${classId}`);
      await revalidateClass();
    } catch (err) {
      toaster.error(getError(err));
    }
  };

  return (
    <>
      <PageHeader title="Turmas" onSearch={(search) => updateParams({ search })}>
        {hasWritePermission && (
          <LinkChild href="/admin/classes/add/basic">
            <Button>Adicionar</Button>
          </LinkChild>
        )}
      </PageHeader>

      <State {...state}>
        {classes?.rows?.map((classData) => (
          <ListGroup
            key={classData.id}
            data={[{ minw: 100, label: 'ID', value: classData.id }, 'break', { label: 'Nome', value: classData.name }]}
            mt="1gap"
            right={
              <Box m="-0.5gap">
                <Tooltip title="Ver">
                  <LinkChild href={`/admin/classes/${classData.id}`}>
                    <Button
                      circular
                      startAddon={({ color }) => <Icon color={color} name="CaretRight" />}
                      variant="text"
                    />
                  </LinkChild>
                </Tooltip>
                {hasWritePermission && (
                  <Tooltip title="Editar">
                    <LinkChild href={`/admin/classes/${classData.id}/basic`}>
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
                      onPress={(e) => handleDeleteClass(e, classData.id)}
                    />
                  </Tooltip>
                )}
              </Box>
            }
          />
        ))}

        <Pagination {...classes} onChange={updateParams} />
      </State>
    </>
  );
}
