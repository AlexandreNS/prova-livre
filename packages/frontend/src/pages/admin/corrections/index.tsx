import type { SchemaQueryParams, SchemaRoute } from '@prova-livre/shared/types/schema.type';

import React from 'react';

import Icon from '@prova-livre/frontend/components/Icon';
import LinkChild from '@prova-livre/frontend/components/LinkChild';
import ListGroup from '@prova-livre/frontend/components/ListGroup';
import NoPermission from '@prova-livre/frontend/components/NoPermission';
import PageHeader from '@prova-livre/frontend/components/PageHeader';
import Pagination from '@prova-livre/frontend/components/Pagination';
import State from '@prova-livre/frontend/components/State';
import useAdminAuth from '@prova-livre/frontend/hooks/useAdminAuth';
import useQueryParams from '@prova-livre/frontend/hooks/useQueryParams';
import useRequest from '@prova-livre/frontend/hooks/useRequest';
import { CorrectionListSchema } from '@prova-livre/shared/dtos/admin/correction/correction.dto';
import { distance, humanize } from '@prova-livre/shared/helpers/date.helper';
import { hasPermissionList } from '@prova-livre/shared/helpers/feature.helper';
import { Badge, Box, Button, Select, Text, Tooltip } from '@react-bulk/web';

export default function Page() {
  const { user } = useAdminAuth();

  const [hasReadPermission, hasWritePermission] = hasPermissionList(
    user?.role,
    'Correction-Read',
    'Correction-Write',
    'Correction-Delete',
  );

  const [params, updateParams] = useQueryParams<SchemaQueryParams<typeof CorrectionListSchema>>({
    page: 1,
    isCorrected: 0,
  });

  const { data: studentApplications, state } = useRequest<SchemaRoute<typeof CorrectionListSchema>>(
    hasReadPermission && '/corrections',
    { params },
  );

  if (!hasReadPermission) {
    return <NoPermission />;
  }

  return (
    <>
      <PageHeader title="Avaliações para Correção" onSearch={(search) => updateParams({ search })}>
        <Select
          value={params.isCorrected}
          w={180}
          options={[
            { value: null, label: 'Todas' },
            { value: 0, label: 'Não corrigidas' },
            { value: 1, label: 'Corrigidas' },
          ]}
          onChange={(_, value) => updateParams({ page: 1, isCorrected: value ?? undefined })}
        />
      </PageHeader>

      <State {...state}>
        {studentApplications?.rows?.map((studentApplication) => (
          <ListGroup
            key={studentApplication.id}
            mt="1gap"
            data={[
              {
                xs: 12,
                md: 'flex',
                label: 'Avaliado',
                value: (
                  <Box row alignItems="flex-end">
                    <Text mr={2} variant="secondary">
                      #{studentApplication.student.id}
                    </Text>
                    <Text mr={2}>{studentApplication.student.name || '[sem nome]'}</Text>
                    <Text mr={2} variant="secondary">{`<${studentApplication.student.email}>`}</Text>
                  </Box>
                ),
              },
              {
                xs: 12,
                md: 'flex',
                label: 'Prova',
                value: studentApplication.application.exam.name,
              },
              {
                value: studentApplication.isCorrected ? (
                  <Badge color="success">Corrigido</Badge>
                ) : (
                  <Badge color="error">Não Corrigido</Badge>
                ),
              },
              'break',
              {
                minw: 100,
                label: 'ID',
                value: studentApplication.id,
              },
              {
                xs: 12,
                md: 'flex',
                label: 'Iniciado em',
                value: humanize(studentApplication.startedAt),
              },
              {
                xs: 12,
                md: 'flex',
                label: 'Enviado em',
                value: humanize(studentApplication.submittedAt),
              },
              {
                xs: 12,
                md: 'flex',
                label: 'Tempo de Prova',
                value: distance(studentApplication.startedAt, studentApplication.submittedAt),
              },
            ]}
            right={
              <Box m="-0.5gap">
                {hasWritePermission && (
                  <Tooltip title="Editar">
                    <LinkChild href={`/admin/corrections/${studentApplication.id}/basic`}>
                      <Button
                        circular
                        startAddon={({ color }) => <Icon color={color} name="Pencil" />}
                        variant="text"
                      />
                    </LinkChild>
                  </Tooltip>
                )}
                <Tooltip position="left" title="Acessar Aplicação de Prova">
                  <LinkChild href={`/admin/applications/${studentApplication.application.id}`} target="_blank">
                    <Button
                      circular
                      startAddon={({ color }) => <Icon color={color} name="ArrowSquareOut" weight="bold" />}
                      variant="text"
                    />
                  </LinkChild>
                </Tooltip>
              </Box>
            }
          />
        ))}

        <Pagination {...studentApplications} onChange={updateParams} />
      </State>
    </>
  );
}
