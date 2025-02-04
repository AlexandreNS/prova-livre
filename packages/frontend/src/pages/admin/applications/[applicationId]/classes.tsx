import type { SchemaQueryParams, SchemaRoute } from '@prova-livre/shared/types/schema.type';

import React, { useState } from 'react';
import { useDependentState } from 'react-state-hooks';

import Icon from '@prova-livre/frontend/components/Icon';
import InputFetch from '@prova-livre/frontend/components/InputFetch';
import ListGroup from '@prova-livre/frontend/components/ListGroup';
import NoPermission from '@prova-livre/frontend/components/NoPermission';
import Pagination from '@prova-livre/frontend/components/Pagination';
import State from '@prova-livre/frontend/components/State';
import { confirm } from '@prova-livre/frontend/helpers/alert.helper';
import { getError } from '@prova-livre/frontend/helpers/api.helper';
import useAdminAuth from '@prova-livre/frontend/hooks/useAdminAuth';
import useIdParam from '@prova-livre/frontend/hooks/useIdParam';
import useRequest from '@prova-livre/frontend/hooks/useRequest';
import ApiAdmin from '@prova-livre/frontend/services/ApiAdmin';
import { ApplicationClassesCreateSchema } from '@prova-livre/shared/dtos/admin/application/application.dto';
import { ClassListSchema } from '@prova-livre/shared/dtos/admin/class/class.dto';
import { hasPermissionList } from '@prova-livre/shared/helpers/feature.helper';
import { validate } from '@prova-livre/shared/helpers/form.helper';
import { number } from '@prova-livre/shared/helpers/number.helper';
import { type AnyObject, type RbkFormEvent, type RbkPointerEvent, useToaster } from '@react-bulk/core';
import { Box, Button, Divider, Form, Grid, Modal, Text, Tooltip } from '@react-bulk/web';

export default function Page() {
  const { user } = useAdminAuth();
  const toaster = useToaster();
  const applicationId = useIdParam('applicationId');
  const [classesParams, setClassesParams] = useDependentState<SchemaQueryParams<typeof ClassListSchema>>(
    () => ({
      page: 1,
      applicationId: number(applicationId),
    }),
    [applicationId],
  );

  const [hasWritePermission] = hasPermissionList(user?.role, 'Application-Write');

  const [isModalAddVisible, setIsModalAddVisible] = useState(false);

  const {
    data: classes,
    state: classesState,
    revalidate: revalidateClasses,
  } = useRequest<SchemaRoute<typeof ClassListSchema>>(hasWritePermission && applicationId && `/classes`, {
    params: classesParams,
  });

  const handleAddClass = async (e: RbkFormEvent, data: AnyObject) => {
    const errors = validate({
      formRef: e.form,
      data,
      schema: ApplicationClassesCreateSchema.body,
    });

    e.form.setErrors(errors);
    if (errors) return;

    try {
      setIsModalAddVisible(false);
      await ApiAdmin.post(`/applications/${applicationId}/classes`, data);
      await revalidateClasses();
    } catch (err) {
      toaster.error(getError(err));
    }
  };

  const handleDeleteClass = async (e: RbkPointerEvent, classId: number) => {
    if (!confirm('Deseja remover a turma desta aplicação de prova?')) {
      return;
    }

    try {
      await ApiAdmin.delete(`/applications/${applicationId}/classes/${classId}`);
      await revalidateClasses();
    } catch (err) {
      toaster.error(getError(err));
    }
  };

  if (!hasWritePermission) {
    return <NoPermission />;
  }

  return (
    <>
      {applicationId && (
        <Box mt="1gap">
          <Button
            align="end"
            startAddon={({ color }) => <Icon color={color} name="Plus" />}
            variant="outline"
            onPress={() => setIsModalAddVisible(true)}
          >
            Turma
          </Button>
        </Box>
      )}

      <State {...classesState}>
        {classes?.rows?.map((classData) => (
          <ListGroup
            key={classData.id}
            mt="1gap"
            data={[
              { minw: 100, label: 'ID', value: classData.id },
              { label: 'Nome', value: classData.name || '[sem nome]', xs: 12, md: 'flex' },
              'break',
              { label: 'Descrição', value: classData.description, xs: 12, md: 'flex' },
            ]}
            right={
              <Box flex justifyContent="center" m="-0.5gap">
                <Tooltip title="Remover">
                  <Button
                    circular
                    color="error"
                    startAddon={({ color }) => <Icon color={color} name="Trash" size={20} />}
                    variant="text"
                    onPress={(e) => handleDeleteClass(e, classData.id)}
                  />
                </Tooltip>
              </Box>
            }
          />
        ))}

        <Pagination {...classes} onChange={setClassesParams} />
      </State>

      <Modal visible={isModalAddVisible} w={480} onClose={() => setIsModalAddVisible(false)}>
        <Form onSubmit={handleAddClass}>
          <Text variant="subtitle">Adicionar Turma</Text>

          <Divider mx="-1gap" my="1gap" />

          <InputFetch label="Turma" name="classId" url="/classes" />

          <Divider mx="-1gap" my="1gap" />

          <Grid gap row>
            <Box xs>
              <Button variant="outline" onPress={() => setIsModalAddVisible(false)}>
                Cancelar
              </Button>
            </Box>
            <Box xs>
              <Button type="submit">Salvar</Button>
            </Box>
          </Grid>
        </Form>
      </Modal>
    </>
  );
}
