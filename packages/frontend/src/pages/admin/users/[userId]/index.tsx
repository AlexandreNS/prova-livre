import type { UserGetSchema } from '@prova-livre/shared/dtos/admin/user/user.dto';
import type { SchemaRoute } from '@prova-livre/shared/types/schema.type';

import React from 'react';

import ListGroup from '@prova-livre/frontend/components/ListGroup';
import NoPermission from '@prova-livre/frontend/components/NoPermission';
import State from '@prova-livre/frontend/components/State';
import useAdminAuth from '@prova-livre/frontend/hooks/useAdminAuth';
import useIdParam from '@prova-livre/frontend/hooks/useIdParam';
import useRequest from '@prova-livre/frontend/hooks/useRequest';
import { UserRoleString } from '@prova-livre/shared/constants/UserRole';
import { hasPermissionList } from '@prova-livre/shared/helpers/feature.helper';
import { color } from '@prova-livre/shared/helpers/string.helper';
import { Badge, Box } from '@react-bulk/web';

export default function Page() {
  const { user } = useAdminAuth();
  const userId = useIdParam('userId');

  const [hasReadPermission] = hasPermissionList(user?.role, 'User-Read');

  const { data: userData, state } = useRequest<SchemaRoute<typeof UserGetSchema>>(
    hasReadPermission && userId && `/users/${userId}`,
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
            {
              label: 'Perfil',
              value: userData?.role && (
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
            { label: 'ID', value: userData?.id, xs: 12, md: 'flex' },
            'break',
            { label: 'Nome', value: userData?.name },
            'break',
            { label: 'E-mail', value: userData?.email },
          ]}
        />
      </State>
    </>
  );
}
