import type { SchemaRoute } from '@prova-livre/shared/types/schema.type';

import { useListState } from 'react-state-hooks';

import Icon from '@prova-livre/frontend/components/Icon';
import InputHtml from '@prova-livre/frontend/components/InputHtml';
import NoPermission from '@prova-livre/frontend/components/NoPermission';
import State from '@prova-livre/frontend/components/State';
import { confirm } from '@prova-livre/frontend/helpers/alert.helper';
import { getError } from '@prova-livre/frontend/helpers/api.helper';
import useAdminAuth from '@prova-livre/frontend/hooks/useAdminAuth';
import useIdParam from '@prova-livre/frontend/hooks/useIdParam';
import useRequest from '@prova-livre/frontend/hooks/useRequest';
import ApiAdmin from '@prova-livre/frontend/services/ApiAdmin';
import { QuestionType } from '@prova-livre/shared/constants/QuestionType';
import {
  QuestionGetSchema,
  QuestionOptionsCreateSchema,
  QuestionOptionsListSchema,
} from '@prova-livre/shared/dtos/admin/question/question.dto';
import { hasPermissionList } from '@prova-livre/shared/helpers/feature.helper';
import { validate } from '@prova-livre/shared/helpers/form.helper';
import { type AnyObject, type RbkFormEvent, type RbkPointerEvent, useToaster } from '@react-bulk/core';
import { Box, Button, Card, Checkbox, Divider, Form, Grid, Input, Switch, Text, Tooltip } from '@react-bulk/web';

export default function Page() {
  const { user } = useAdminAuth();
  const toaster = useToaster();
  const questionId = useIdParam('questionId');

  const [hasWritePermission] = hasPermissionList(user?.role, 'Question-Write');

  const [editingIds, { push: pushEditingId, remove: removeEditingId }] = useListState<number>([]);

  const { data: question, state } = useRequest<SchemaRoute<typeof QuestionGetSchema>>(
    hasWritePermission && questionId && `/questions/${questionId}`,
    {
      autoRevalidate: false,
    },
  );

  const {
    data: options,
    mutate: mutateOptions,
    state: optionsState,
  } = useRequest<SchemaRoute<typeof QuestionOptionsListSchema>>(
    hasWritePermission && questionId && `/questions/${questionId}/options`,
    {
      autoRevalidate: false,
    },
  );

  const handleAddOption = async () => {
    // @ts-expect-error
    mutateOptions((current) => [...current, { _draft: true, id: Date.now() }]);

    Array.from(document.querySelectorAll('.action-save-option')).at(-1)?.scrollIntoView();
  };

  const handleSubmitOption = async (e: RbkFormEvent, data: AnyObject) => {
    const optionId = data._draft ? null : data.id;
    const editingId = data.id;

    delete data.id;
    delete data._draft;

    const errors = validate({
      formRef: e.form,
      data,
      schema: QuestionOptionsCreateSchema.body,
    });

    e.form.setErrors(errors);
    if (errors) return;

    try {
      removeEditingId((id) => id === editingId);

      const response = await ApiAdmin.save(`/questions/${questionId}/options`, optionId, data);
      mutateOptions((current) => current.map((item) => (item.id === editingId ? response.data : item)));

      toaster.success('Os dados foram salvos.');
    } catch (err) {
      toaster.error(getError(err));
    }
  };

  const handleCancelOption = async (e: RbkFormEvent, data: AnyObject) => {
    if (data._draft) {
      mutateOptions((current) => current.filter(({ id }) => id !== data.id));
      return;
    }

    const backup = options?.find(({ id }) => id === data.id);
    removeEditingId((id) => id === data.id);
    e.form.setData(backup ?? {});
  };

  const handleDeleteOption = async (e: RbkPointerEvent, optionId: number) => {
    if (!confirm('Deseja remover esta opção?')) {
      return;
    }

    try {
      await ApiAdmin.delete(`/questions/${questionId}/options/${optionId}`);
      mutateOptions((current) => current.filter(({ id }) => id !== optionId));
    } catch (err) {
      toaster.error(getError(err));
    }
  };

  if (!hasWritePermission) {
    return <NoPermission />;
  }

  return (
    <>
      <State {...state}>
        {question?.type !== QuestionType.OPTIONS ? (
          <Card mt="1gap">
            <Text>Disponível somente para questões de múltipla escolha.</Text>
          </Card>
        ) : (
          <>
            {questionId && (
              <Box mt="1gap">
                <Button
                  align="end"
                  startAddon={({ color }) => <Icon color={color} name="Plus" />}
                  variant="outline"
                  onPress={handleAddOption}
                >
                  Opção
                </Button>
              </Box>
            )}

            <State {...optionsState}>
              {options?.map((option) => {
                const isEditing = option._draft || editingIds.includes(option.id);

                return (
                  <Form key={option.id} onCancel={handleCancelOption} onSubmit={handleSubmitOption}>
                    {option._draft && (
                      <Switch hidden checked={Boolean(option._draft)} name="_draft" value={option._draft} />
                    )}
                    <Input name="id" type="hidden" value={option.id} />

                    <Card mt="1gap">
                      <Grid gap>
                        <Box xs>
                          <Checkbox checked={option.isCorrect} disabled={!isEditing} label="Correta" name="isCorrect" />
                        </Box>
                        {!isEditing && (
                          <Box>
                            <Box noWrap row m={-1}>
                              <Tooltip position="left" title="Editar">
                                <Button
                                  circular
                                  startAddon={({ color }) => <Icon color={color} name="Pencil" />}
                                  variant="text"
                                  onPress={() => pushEditingId(option.id)}
                                />
                              </Tooltip>
                              <Tooltip position="left" title="Remover">
                                <Button
                                  circular
                                  color="error"
                                  startAddon={({ color }) => <Icon color={color} name="Trash" />}
                                  variant="text"
                                  onPress={(e) => handleDeleteOption(e, option.id)}
                                />
                              </Tooltip>
                            </Box>
                          </Box>
                        )}
                        <Box xs={12}>
                          <InputHtml
                            autoFocus
                            required
                            disabled={!isEditing}
                            name="description"
                            value={option.description}
                          />
                        </Box>
                      </Grid>

                      {isEditing && (
                        <>
                          <Divider mx="-1gap" my="1gap" />
                          <Grid gap justifyContent="end">
                            <Box>
                              <Button color={option._draft ? 'error' : 'primary'} type="cancel" variant="text">
                                {option._draft ? 'Descartar' : 'Cancelar'}
                              </Button>
                            </Box>
                            <Box>
                              <Button className="action-save-option" type="submit">
                                {option._draft ? 'Salvar Opção' : 'Atualizar Opção'}
                              </Button>
                            </Box>
                          </Grid>
                        </>
                      )}
                    </Card>
                  </Form>
                );
              })}
            </State>
          </>
        )}
      </State>
    </>
  );
}
