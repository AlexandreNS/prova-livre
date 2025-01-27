import type { StudentListSchema } from '@prova-livre/shared/dtos/admin/student/student.dto';
import type { SchemaQueryParams, SchemaResponse, SchemaRoute } from '@prova-livre/shared/types/schema.type';

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
import { ClassStudentsCreateSchema } from '@prova-livre/shared/dtos/admin/class/class.dto';
import { hasPermissionList } from '@prova-livre/shared/helpers/feature.helper';
import { validate } from '@prova-livre/shared/helpers/form.helper';
import { number } from '@prova-livre/shared/helpers/number.helper';
import { type AnyObject, type RbkFormEvent, type RbkPointerEvent, useToaster } from '@react-bulk/core';
import { Box, Button, Divider, Form, Grid, Modal, Text, Tooltip } from '@react-bulk/web';

export default function Page() {
  const { user } = useAdminAuth();
  const toaster = useToaster();
  const classId = useIdParam('classId');
  const [studentsParams, setStudentsParams] = useDependentState<SchemaQueryParams<typeof StudentListSchema>>(
    () => ({
      page: 1,
      classId: number(classId),
    }),
    [classId],
  );

  const [hasWritePermission] = hasPermissionList(user?.role, 'Class-Write');

  const [isModalAddVisible, setIsModalAddVisible] = useState(false);

  const {
    data: students,
    state: studentsState,
    revalidate: revalidateStudents,
  } = useRequest<SchemaRoute<typeof StudentListSchema>>(hasWritePermission && classId && `/students`, {
    params: studentsParams,
  });

  const handleAddStudent = async (e: RbkFormEvent, data: AnyObject) => {
    const errors = validate({
      formRef: e.form,
      data,
      schema: ClassStudentsCreateSchema.body,
    });

    e.form.setErrors(errors);
    if (errors) return;

    try {
      setIsModalAddVisible(false);
      await ApiAdmin.post(`/classes/${classId}/students`, data);
      await revalidateStudents();
    } catch (err) {
      toaster.error(getError(err));
    }
  };

  const handleDeleteStudent = async (e: RbkPointerEvent, studentId: number) => {
    if (!confirm('Deseja remover o estudante desta turma?')) {
      return;
    }

    try {
      await ApiAdmin.delete(`/classes/${classId}/students/${studentId}`);
      await revalidateStudents();
    } catch (err) {
      toaster.error(getError(err));
    }
  };

  if (!hasWritePermission) {
    return <NoPermission />;
  }

  return (
    <>
      {classId && (
        <Box mt="1gap">
          <Button
            align="end"
            startAddon={({ color }) => <Icon color={color} name="Plus" />}
            variant="outline"
            onPress={() => setIsModalAddVisible(true)}
          >
            Estudante
          </Button>
        </Box>
      )}

      <State {...studentsState}>
        {students?.rows?.map((student) => (
          <ListGroup
            key={student.id}
            mt="1gap"
            data={[
              { minw: 100, label: 'ID', value: student.id },
              { label: 'Nome', value: student.name || '[sem nome]', xs: 12, md: 'flex' },
              { label: 'E-mail', value: student.email, xs: 12, md: 'flex' },
            ]}
            right={
              <Box flex justifyContent="center" m="-0.5gap">
                <Tooltip title="Remover">
                  <Button
                    circular
                    color="error"
                    startAddon={({ color }) => <Icon color={color} name="Trash" size={20} />}
                    variant="text"
                    onPress={(e) => handleDeleteStudent(e, student.id)}
                  />
                </Tooltip>
              </Box>
            }
          />
        ))}

        <Pagination {...students} onChange={setStudentsParams} />
      </State>

      <Modal visible={isModalAddVisible} w={480} onClose={() => setIsModalAddVisible(false)}>
        <Form onSubmit={handleAddStudent}>
          <Text variant="subtitle">Adicionar Estudante</Text>

          <Divider mx="-1gap" my="1gap" />

          <InputFetch
            label="Estudante"
            name="studentId"
            url="/students"
            customLabel={(item: SchemaResponse<typeof StudentListSchema>['rows'][number]) => (
              <Box row alignItems="center">
                <Text mr={1} variant="secondary">
                  #{item.id}
                </Text>
                <Text mr={1}>{item.name || '[sem nome]'}</Text>
                <Text variant="secondary">{`<${item.email}>`}</Text>
              </Box>
            )}
          />

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
