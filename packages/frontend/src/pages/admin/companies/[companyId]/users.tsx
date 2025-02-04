import type { CompanyUserListSchema } from '@prova-livre/shared/dtos/admin/company/company.dto';
import type { SchemaQueryParams, SchemaRoute } from '@prova-livre/shared/types/schema.type';

import ListGroup from '@prova-livre/frontend/components/ListGroup';
import Pagination from '@prova-livre/frontend/components/Pagination';
import State from '@prova-livre/frontend/components/State';
import useIdParam from '@prova-livre/frontend/hooks/useIdParam';
import useQueryParams from '@prova-livre/frontend/hooks/useQueryParams';
import useRequest from '@prova-livre/frontend/hooks/useRequest';
import { UserRoleString } from '@prova-livre/shared/constants/UserRole';
import { color } from '@prova-livre/shared/helpers/string.helper';
import { Badge, Box } from '@react-bulk/web';

export default function Page() {
  const companyId = useIdParam('companyId');
  const [usersParams, setUsersParams] = useQueryParams<SchemaQueryParams<typeof CompanyUserListSchema>>({
    page: 1,
  });

  const { data: users, state } = useRequest<SchemaRoute<typeof CompanyUserListSchema>>(
    companyId && `/companies/${companyId}/users`,
    {
      params: usersParams,
      autoRevalidate: false,
      noCache: true,
    },
  );

  return (
    <>
      <State {...state}>
        {users?.rows?.map((user) => (
          <ListGroup
            key={user.id}
            mt="1gap"
            data={[
              {
                label: 'Perfil',
                value: (
                  <Box align="flex-start">
                    <Badge color={color(UserRoleString[user.role])} size={2.5}>
                      {UserRoleString[user.role]}
                    </Badge>
                  </Box>
                ),
                xs: 12,
                md: 'auto',
                mr: '1gap',
              },
              { minw: 100, label: 'ID', value: user.id },
              { label: 'Nome', value: user.name || '[sem nome]', xs: 12, md: 'auto' },
              { label: 'E-mail', value: user.email, xs: 12, md: 'flex' },
            ]}
          />
        ))}

        <Pagination {...users} onChange={setUsersParams} />
      </State>
    </>
  );
}
