import type { StudentListSchema } from '@prova-livre/shared/dtos/admin/student/student.dto';
import type { SchemaQueryParams, SchemaResponse, SchemaRoute } from '@prova-livre/shared/types/schema.type';

import React, { useState } from 'react';

import CopyButton from '@prova-livre/frontend/components/CopyButton';
import Icon from '@prova-livre/frontend/components/Icon';
import InputFetch from '@prova-livre/frontend/components/InputFetch';
import LinkChild from '@prova-livre/frontend/components/LinkChild';
import ListGroup from '@prova-livre/frontend/components/ListGroup';
import Pagination from '@prova-livre/frontend/components/Pagination';
import State from '@prova-livre/frontend/components/State';
import { getError } from '@prova-livre/frontend/helpers/api.helper';
import useAdminAuth from '@prova-livre/frontend/hooks/useAdminAuth';
import useIdParam from '@prova-livre/frontend/hooks/useIdParam';
import useQueryParams from '@prova-livre/frontend/hooks/useQueryParams';
import useRequest from '@prova-livre/frontend/hooks/useRequest';
import ApiAdmin from '@prova-livre/frontend/services/ApiAdmin';
import {
  StudentApplicationStatus,
  StudentApplicationStatusString,
} from '@prova-livre/shared/constants/StudentApplicationStatus';
import {
  ApplicationStudentsCreateSchema,
  ApplicationStudentsListSchema,
} from '@prova-livre/shared/dtos/admin/application/application.dto';
import { humanize } from '@prova-livre/shared/helpers/date.helper';
import { hasPermissionList } from '@prova-livre/shared/helpers/feature.helper';
import { validate } from '@prova-livre/shared/helpers/form.helper';
import { type AnyObject, type RbkFormEvent, type RbkPointerEvent, useToaster } from '@react-bulk/core';
import { Box, Button, Card, Collapse, Divider, Form, Grid, Modal, Text, Tooltip } from '@react-bulk/web';

export default function Page() {
  const { user } = useAdminAuth();
  const toaster = useToaster();
  const applicationId = useIdParam('applicationId');
  const [params, updateParams] = useQueryParams<SchemaQueryParams<typeof ApplicationStudentsListSchema>>({
    page: 1,
  });

  const [hasReadPermission, hasWritePermission, hasCorrectionDeletePermission] = hasPermissionList(
    user?.role,
    'Application-Read',
    'Application-Write',
    'Correction-Delete',
  );

  const [isModalAddVisible, setIsModalAddVisible] = useState(false);

  const [visible, setVisible] = useState<Record<number, boolean>>({});

  const {
    data: students,
    state,
    revalidate: revalidateStudents,
  } = useRequest<SchemaRoute<typeof ApplicationStudentsListSchema>>(
    hasReadPermission && applicationId && `/applications/${applicationId}/students`,
    { params },
  );

  const handleAddStudent = async (e: RbkFormEvent, data: AnyObject) => {
    const errors = validate({
      formRef: e.form,
      data,
      schema: ApplicationStudentsCreateSchema.body,
    });

    e.form.setErrors(errors);
    if (errors) return;

    try {
      setIsModalAddVisible(false);
      await ApiAdmin.post(`/applications/${applicationId}/students`, data);
      await revalidateStudents();
    } catch (err) {
      toaster.error(getError(err));
    }
  };

  const handleDeleteStudentApplication = async (e: RbkPointerEvent, data: AnyObject) => {
    if (data.resetApplication && !confirm('Deseja reiniciar a avaliação e remover todas as repostas do estudante?')) {
      return;
    }

    if (!data.resetApplication && !confirm('Deseja remover a avaliação do estudante?')) {
      return;
    }

    const studentApplicationId = data.id;

    try {
      await ApiAdmin.delete(`/corrections/${studentApplicationId}`, { data });
      await revalidateStudents();
    } catch (err) {
      toaster.error(getError(err));
    }
  };

  const handleToggleStudent = (studentId: number) => {
    setVisible((current) => ({ ...current, [studentId]: !current[studentId] }));
  };

  return (
    <>
      {applicationId && hasWritePermission && (
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

      <State {...state}>
        {students?.rows?.map(({ studentApplicationResult, ...student }) => (
          <Card key={student.id} mt="1gap">
            <Box noWrap row>
              <Box flex row>
                <Text alignSelf="center" mr={2} variant="secondary">
                  #{student.id}
                </Text>
                <Text mr={1} variant="subtitle">
                  {student.name || '[sem nome]'}
                </Text>
                {student.name ? <CopyButton value={student.name} /> : null}
              </Box>
              <Box m="-0.5gap">
                <Tooltip title={visible[student.id] ? 'Ocultar' : 'Mostrar'}>
                  <Button circular variant="text" onPress={() => handleToggleStudent(student.id)}>
                    <Icon name={visible[student.id] ? 'CaretUp' : 'CaretDown'} />
                  </Button>
                </Tooltip>
              </Box>
            </Box>

            <Box noWrap row alignItems="center" mt={1}>
              <Text mr={1}>{student.email || '[sem email]'}</Text>
              {student.email ? <CopyButton value={student.email} /> : null}
            </Box>

            {studentApplicationResult?.map((studentApplication, index) => {
              const isVisible = Boolean(visible[student.id]);
              return (
                <Collapse key={index} visible={isVisible}>
                  <ListGroup
                    bg="background.tertiary"
                    mt="1gap"
                    shadow={1}
                    data={[
                      {
                        label: (
                          <Box flex row>
                            <Text alignSelf="flex-end" mr={2} variant="secondary">
                              {studentApplication.id ? `#${studentApplication.id}` : '[Inscrição Provisória]'}
                            </Text>
                            <Text bold mr={1}>
                              Tentativa {index + 1}
                            </Text>
                          </Box>
                        ),
                      },
                      {
                        label: studentApplication.id ? (
                          <Box row m="-0.5gap">
                            {[
                              StudentApplicationStatus.AWAITING_CORRECTION,
                              StudentApplicationStatus.SUBMITTED,
                            ].includes(studentApplication.status as any) ? (
                              <Tooltip title="Ver">
                                <LinkChild href={`/admin/corrections/${studentApplication.id}/basic`} target="_blank">
                                  <Button
                                    circular
                                    variant="text"
                                    startAddon={({ color }) => (
                                      <Icon color={color} name="ArrowSquareOut" weight="bold" />
                                    )}
                                  />
                                </LinkChild>
                              </Tooltip>
                            ) : null}
                            {studentApplication.id && studentApplication.startedAt && hasCorrectionDeletePermission ? (
                              <Tooltip title="Reiniciar Avaliação">
                                <Button
                                  circular
                                  color="error"
                                  startAddon={({ color }) => <Icon color={color} name="Eraser" weight="bold" />}
                                  variant="text"
                                  onPress={(e) =>
                                    handleDeleteStudentApplication(e, {
                                      id: studentApplication.id,
                                      resetApplication: true,
                                    })
                                  }
                                />
                              </Tooltip>
                            ) : null}
                            {studentApplication.id && hasCorrectionDeletePermission ? (
                              <Tooltip title="Remover Avaliação">
                                <Button
                                  circular
                                  color="error"
                                  startAddon={({ color }) => <Icon color={color} name="Trash" weight="bold" />}
                                  variant="text"
                                  onPress={(e) =>
                                    handleDeleteStudentApplication(e, {
                                      id: studentApplication.id,
                                      resetApplication: false,
                                    })
                                  }
                                />
                              </Tooltip>
                            ) : null}
                          </Box>
                        ) : null,
                      },
                      'break',
                      {
                        label: 'Status',
                        value: studentApplication.status && StudentApplicationStatusString[studentApplication.status],
                      },
                      {
                        label: 'Iniciado em',
                        value: humanize(studentApplication?.startedAt) || '-',
                      },
                      {
                        label: 'Finalizado em',
                        value: humanize(studentApplication?.submittedAt) || '-',
                      },
                      {
                        label: 'Nota',
                        value: studentApplication?.studentScore ?? '-',
                      },
                      ...(studentApplication.minScore &&
                      studentApplication.status === StudentApplicationStatus.SUBMITTED
                        ? [
                            {
                              label: 'Pontuação para Aprovação',
                              value: studentApplication?.minScore ?? '-',
                            },
                          ]
                        : []),
                      ...(studentApplication.maxScore &&
                      studentApplication.status === StudentApplicationStatus.SUBMITTED
                        ? [
                            {
                              label: 'Pontuação Máxima',
                              value: studentApplication?.maxScore ?? '-',
                            },
                          ]
                        : []),
                    ]}
                  />
                </Collapse>
              );
            })}
          </Card>
        ))}

        <Pagination {...students} plural="avaliados" singular="avaliado" onChange={updateParams} />
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
