import type { ApplicationListSchema } from '@prova-livre/shared/dtos/admin/application/application.dto';
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
import { humanize } from '@prova-livre/shared/helpers/date.helper';
import { hasPermissionList } from '@prova-livre/shared/helpers/feature.helper';
import { type RbkPointerEvent, useToaster } from '@react-bulk/core';
import { Box, Button, Tooltip } from '@react-bulk/web';

export default function Page() {
  const { user } = useAdminAuth();
  const toaster = useToaster();

  const [hasReadPermission, hasWritePermission, hasDeletePermission] = hasPermissionList(
    user?.role,
    'Application-Read',
    'Application-Write',
    'Application-Delete',
  );

  const [params, updateParams] = useQueryParams<SchemaQueryParams<typeof ApplicationListSchema>>({
    page: 1,
  });

  const {
    data: applications,
    revalidate: revalidateApplications,
    state,
  } = useRequest<SchemaRoute<typeof ApplicationListSchema>>(hasReadPermission && '/applications', { params });

  const handleDeleteApplication = async (_: RbkPointerEvent, applicationId: number) => {
    if (!confirm('Deseja remover permanentemente a aplicação?')) {
      return;
    }

    try {
      await ApiAdmin.delete(`/applications/${applicationId}`);
      await revalidateApplications();
    } catch (err) {
      toaster.error(getError(err));
    }
  };

  if (!hasReadPermission) {
    return <NoPermission />;
  }

  return (
    <>
      <PageHeader title="Aplicações de Prova" onSearch={(search) => updateParams({ search })}>
        {hasWritePermission && (
          <LinkChild href="/admin/applications/add/basic">
            <Button>Adicionar</Button>
          </LinkChild>
        )}
      </PageHeader>

      <State {...state}>
        {applications?.rows?.map((application) => (
          <ListGroup
            key={application.id}
            mt="1gap"
            data={[
              {
                minw: 100,
                label: 'ID',
                value: application.id,
              },
              {
                xs: 12,
                md: 'flex',
                label: 'Prova',
                value: application.exam?.name,
              },
              'break',
              {
                xs: 12,
                md: 'flex',
                label: 'Início',
                value: humanize(application.startedAt),
              },
              {
                xs: 12,
                md: 'flex',
                label: 'Término',
                value: humanize(application.endedAt),
              },
            ]}
            right={
              <Box m="-0.5gap">
                <Tooltip title="Ver">
                  <LinkChild href={`/admin/applications/${application.id}`}>
                    <Button
                      circular
                      startAddon={({ color }) => <Icon color={color} name="CaretRight" />}
                      variant="text"
                    />
                  </LinkChild>
                </Tooltip>
                {hasWritePermission && (
                  <Tooltip title="Editar">
                    <LinkChild href={`/admin/applications/${application.id}/basic`}>
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
                      onPress={(e) => handleDeleteApplication(e, application.id)}
                    />
                  </Tooltip>
                )}
              </Box>
            }
          />
        ))}

        <Pagination {...applications} onChange={updateParams} />
      </State>
    </>
  );
}
