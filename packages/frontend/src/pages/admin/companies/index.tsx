import type { CompanyListSchema } from '@prova-livre/shared/dtos/admin/company/company.dto';
import type { SchemaQueryParams, SchemaRoute } from '@prova-livre/shared/types/schema.type';

import React from 'react';

import Icon from '@prova-livre/frontend/components/Icon';
import LinkChild from '@prova-livre/frontend/components/LinkChild';
import ListGroup from '@prova-livre/frontend/components/ListGroup';
import NoPermission from '@prova-livre/frontend/components/NoPermission';
import PageHeader from '@prova-livre/frontend/components/PageHeader';
import State from '@prova-livre/frontend/components/State';
import useAdminAuth from '@prova-livre/frontend/hooks/useAdminAuth';
import useQueryParams from '@prova-livre/frontend/hooks/useQueryParams';
import useRequest from '@prova-livre/frontend/hooks/useRequest';
import { hasPermission } from '@prova-livre/shared/helpers/feature.helper';
import { Box, Button, Tooltip } from '@react-bulk/web';

export default function Page() {
  const { user } = useAdminAuth();

  const [params, updateParams] = useQueryParams<SchemaQueryParams<typeof CompanyListSchema>>({
    page: 1,
  });

  const { data: companies, state } = useRequest<SchemaRoute<typeof CompanyListSchema>>('/companies', {
    params,
    noCache: true,
    autoRevalidate: false,
  });

  if (!user?.permissions.createCompany) {
    return <NoPermission />;
  }

  return (
    <>
      <PageHeader title="Instituições" onSearch={(search) => updateParams({ search })}>
        <LinkChild href="/admin/companies/add/basic">
          <Button>Adicionar</Button>
        </LinkChild>
      </PageHeader>

      <State {...state}>
        {companies?.map((company) => (
          <ListGroup
            key={company.id}
            mt="1gap"
            data={[
              {
                minw: 100,
                label: 'ID',
                value: company.id,
              },
              {
                xs: 12,
                md: 'flex',
                label: 'Nome',
                value: company.name,
              },
            ]}
            right={
              <Box m="-0.5gap">
                <Tooltip title="Ver">
                  <LinkChild href={`/admin/companies/${company.id}`}>
                    <Button
                      circular
                      startAddon={({ color }) => <Icon color={color} name="CaretRight" />}
                      variant="text"
                    />
                  </LinkChild>
                </Tooltip>
                {hasPermission(company?.role, 'Company-Write') && (
                  <Tooltip title="Editar">
                    <LinkChild href={`/admin/companies/${company.id}/basic`}>
                      <Button
                        circular
                        startAddon={({ color }) => <Icon color={color} name="Pencil" />}
                        variant="text"
                      />
                    </LinkChild>
                  </Tooltip>
                )}
              </Box>
            }
          />
        ))}
      </State>
    </>
  );
}
