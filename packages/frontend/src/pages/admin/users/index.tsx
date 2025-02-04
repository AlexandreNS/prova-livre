import type { UserListSchema } from '@prova-livre/shared/dtos/admin/user/user.dto';
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
import { UserRoleString } from '@prova-livre/shared/constants/UserRole';
import { format } from '@prova-livre/shared/helpers/date.helper';
import { hasPermissionList } from '@prova-livre/shared/helpers/feature.helper';
import { color } from '@prova-livre/shared/helpers/string.helper';
import { type RbkPointerEvent, useToaster } from '@react-bulk/core';
import { Badge, Box, Button, Tooltip } from '@react-bulk/web';

export default function Page() {
  const { user } = useAdminAuth();
  const toaster = useToaster();

  const [hasReadPermission, hasWritePermission, hasDeletePermission] = hasPermissionList(
    user?.role,
    'User-Read',
    'User-Write',
    'User-Delete',
  );

  const [params, updateParams] = useQueryParams<SchemaQueryParams<typeof UserListSchema>>({
    page: 1,
  });

  const {
    data: users,
    revalidate: revalidateUsers,
    state,
  } = useRequest<SchemaRoute<typeof UserListSchema>>(hasReadPermission && '/users', { params });

  const handleDeleteUser = async (_: RbkPointerEvent, userId: number) => {
    if (!confirm('Deseja remover permanentemente o usuário?')) {
      return;
    }

    try {
      await ApiAdmin.delete(`/users/${userId}`);
      await revalidateUsers();
    } catch (err) {
      toaster.error(getError(err));
    }
  };

  if (!hasReadPermission) {
    return <NoPermission />;
  }

  return (
    <>
      <PageHeader title="Usuários" onSearch={(search) => updateParams({ search })}>
        {hasWritePermission && (
          <LinkChild href="/admin/users/add/basic">
            <Button>Adicionar</Button>
          </LinkChild>
        )}
      </PageHeader>

      <State {...state}>
        {users?.rows?.map((userData) => (
          <ListGroup
            key={userData.id}
            mt="1gap"
            data={[
              {
                label: 'Perfil',
                value: (
                  <Box align="flex-start">
                    <Badge color={color(UserRoleString[userData.role])} size={2.5}>
                      {UserRoleString[userData.role]}
                    </Badge>
                  </Box>
                ),
                xs: 12,
                md: 'auto',
                mr: '1gap',
              },
              { minw: 100, label: 'ID', value: userData.id },
              { label: 'Nome', value: userData.name || '[sem nome]', xs: 12, md: 'flex' },
              'break',
              { label: 'E-mail', value: userData.email, xs: 12, md: 'flex' },
              {
                xs: 12,
                md: 'flex',
                label: 'Último Acesso',
                value: userData.accessedAt ? format(userData.accessedAt, true) : 'Nunca',
              },
            ]}
            right={
              <Box m="-0.5gap">
                <Tooltip title="Ver">
                  <LinkChild href={`/admin/users/${userData.id}`}>
                    <Button
                      circular
                      startAddon={({ color }) => <Icon color={color} name="CaretRight" />}
                      variant="text"
                    />
                  </LinkChild>
                </Tooltip>
                {hasWritePermission && (
                  <Tooltip title="Editar">
                    <LinkChild href={`/admin/users/${userData.id}/basic`}>
                      <Button
                        circular
                        startAddon={({ color }) => <Icon color={color} name="Pencil" />}
                        variant="text"
                      />
                    </LinkChild>
                  </Tooltip>
                )}
                {hasDeletePermission && userData.id !== user?.id && (
                  <Tooltip title="Remover">
                    <Button
                      circular
                      color="error"
                      startAddon={({ color }) => <Icon color={color} name="Trash" />}
                      variant="text"
                      onPress={(e) => handleDeleteUser(e, userData.id)}
                    />
                  </Tooltip>
                )}
              </Box>
            }
          />
        ))}

        <Pagination {...users} onChange={updateParams} />
      </State>
    </>
  );
}
