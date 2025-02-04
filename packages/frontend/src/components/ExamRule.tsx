import type { SchemaRoute, SchemaType } from '@prova-livre/shared/types/schema.type';

import { useState } from 'react';

import Icon from '@prova-livre/frontend/components/Icon';
import InputFetch from '@prova-livre/frontend/components/InputFetch';
import { confirm } from '@prova-livre/frontend/helpers/alert.helper';
import { getError } from '@prova-livre/frontend/helpers/api.helper';
import useRequest from '@prova-livre/frontend/hooks/useRequest';
import ApiAdmin from '@prova-livre/frontend/services/ApiAdmin';
import { QuestionType, QuestionTypeString } from '@prova-livre/shared/constants/QuestionType';
import { ExamRulesCountSchema, ExamRulesCreateSchema } from '@prova-livre/shared/dtos/admin/exam/exam.dto';
import { ExamRuleSchema } from '@prova-livre/shared/dtos/admin/exam/exam.schema';
import { validate } from '@prova-livre/shared/helpers/form.helper';
import { number } from '@prova-livre/shared/helpers/number.helper';
import { pluralize } from '@prova-livre/shared/helpers/string.helper';
import { type AnyObject, type RbkFormEvent, type RbkPointerEvent, useToaster } from '@react-bulk/core';
import {
  Box,
  Button,
  Card,
  Checkbox,
  Divider,
  Form,
  Grid,
  Input,
  Loading,
  Modal,
  Select,
  Switch,
  Text,
  Tooltip,
} from '@react-bulk/web';

export type ExamRuleRulesProps = {
  examId: number;
  examRule: Partial<SchemaType<typeof ExamRuleSchema>>;
  mutate: any;
  onRefresh: () => Promise<void>;
};

export default function ExamRule({ examId, examRule, mutate, onRefresh }: ExamRuleRulesProps) {
  const toaster = useToaster();

  const [_isEditing, setIsEditing] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [questionRuleType, setQuestionRuleType] = useState(examRule.questionId ? 'select' : 'generate');

  const examRuleId = examRule._draft ? undefined : examRule.id;
  const isEditing = examRule._draft || _isEditing;

  const {
    data: count,
    isLoading: isLoadingCount,
    revalidate: revalidateCount,
  } = useRequest<SchemaRoute<typeof ExamRulesCountSchema>>(
    examRuleId && questionRuleType === 'generate' && `/exams/${examId}/questions/${examRuleId}/count`,
  );

  const handleSubmitQuestion = async (e: RbkFormEvent, data: AnyObject) => {
    const examRuleId = data._draft ? null : data.id;
    const editingId = data.id;

    delete data.id;
    delete data._draft;

    const errors = validate({
      formRef: e.form,
      data,
      schema: ExamRulesCreateSchema.body,
    });

    e.form.setErrors(errors);
    if (errors) return;

    try {
      setIsEditing(false);

      const response = await ApiAdmin.save(`/exams/${examId}/questions`, examRuleId, data);
      // @ts-expect-error
      await mutate((current) => current.map((item) => (item.id === editingId ? response.data : item)));
      await revalidateCount();

      toaster.success('Os dados foram salvos.');
    } catch (err) {
      toaster.error(getError(err));
    }
  };

  const handleCancelQuestion = async (e: RbkFormEvent, data: AnyObject) => {
    if (data._draft) {
      // @ts-expect-error
      await mutate((current) => current.filter(({ id }) => id !== data.id));
      return;
    }

    setIsEditing(false);
    e.form.setData(examRule);
  };

  const handleDeleteQuestion = async () => {
    if (!confirm('Deseja remover esta opção?')) {
      return;
    }

    try {
      await ApiAdmin.delete(`/exams/${examId}/questions/${examRuleId}`);
      // @ts-expect-error
      await mutate((current) => current.filter(({ id }) => id !== examRuleId));
      await revalidateCount();
    } catch (err) {
      toaster.error(getError(err));
    }
  };

  const handleAddCategory = async (e: RbkFormEvent, data: AnyObject) => {
    const { categoryId } = data;

    try {
      setIsModalVisible(false);
      await ApiAdmin.put(`/exams/${examId}/questions/${examRuleId}/categories/${categoryId}`);
      await revalidateCount();
      await onRefresh();
    } catch (err) {
      toaster.error(getError(err));
    }
  };

  const handleDeleteCategory = async (e: RbkPointerEvent, categoryId: number) => {
    if (!confirm('Deseja desassociar a categoria desta questão?')) {
      return;
    }

    try {
      await ApiAdmin.delete(`/exams/${examId}/questions/${examRuleId}/categories/${categoryId}`);
      await revalidateCount();
      await onRefresh();
    } catch (err) {
      toaster.error(getError(err));
    }
  };

  return (
    <>
      <Form onCancel={handleCancelQuestion} onSubmit={handleSubmitQuestion}>
        {examRule._draft && <Switch hidden checked={Boolean(examRule._draft)} name="_draft" value={examRule._draft} />}
        {examRule.id && <Input name="id" type="hidden" value={examRule.id} />}

        <Card mt="1gap">
          <Grid gap>
            <Box xs>
              <Card align="start" bg="background.secondary" py={2} shadow={0}>
                <Box row g={2}>
                  <Checkbox
                    controlled
                    unique
                    checked={questionRuleType === 'generate'}
                    disabled={!isEditing}
                    label="Questões Dinâmicas"
                    onChange={() => setQuestionRuleType('generate')}
                  />
                  <Checkbox
                    controlled
                    unique
                    checked={questionRuleType === 'select'}
                    disabled={!isEditing}
                    label="Questão Fixa"
                    onChange={() => setQuestionRuleType('select')}
                  />
                </Box>
              </Card>
            </Box>

            {!isEditing && (
              <Box>
                <Box noWrap row m={-1}>
                  <Tooltip position="left" title="Editar">
                    <Button
                      circular
                      startAddon={({ color }) => <Icon color={color} name="Pencil" />}
                      variant="text"
                      onPress={() => setIsEditing(true)}
                    />
                  </Tooltip>
                  <Tooltip position="left" title="Remover">
                    <Button
                      circular
                      color="error"
                      startAddon={({ color }) => <Icon color={color} name="Trash" />}
                      variant="text"
                      onPress={handleDeleteQuestion}
                    />
                  </Tooltip>
                </Box>
              </Box>
            )}

            <Box p={0} xs={12} />

            <Box md={3} xs={6}>
              <Input
                disabled={!isEditing}
                label="Pontos por Questão"
                name="score"
                type="number"
                value={examRule.score}
              />
            </Box>

            {questionRuleType === 'select' && (
              <Box md="flex" xs={12}>
                <InputFetch
                  required
                  disabled={!isEditing}
                  label="Questão"
                  labelAttr="description"
                  name="questionId"
                  url="/questions"
                  value={examRule.questionId}
                  params={{
                    enabled: true,
                  }}
                />
              </Box>
            )}

            {questionRuleType === 'generate' && (
              <>
                <Box md={3} xs={6}>
                  <Input name="questionId" type="hidden" value={null} />

                  <Input
                    disabled={!isEditing}
                    label="Qtde. Questões"
                    name="questionsCount"
                    type="number"
                    value={examRule.questionsCount}
                  />
                </Box>

                <Box xs="flex">
                  <Select
                    disabled={!isEditing}
                    label="Tipo de Questão"
                    name="questionType"
                    value={examRule.questionType}
                    options={[
                      { label: 'Todas', value: null },
                      ...Object.values(QuestionType).map((type) => ({
                        label: QuestionTypeString[type],
                        value: type,
                      })),
                    ]}
                  />
                </Box>
              </>
            )}
          </Grid>

          {isEditing && questionRuleType && (
            <>
              <Divider mx="-1gap" my="1gap" />
              <Grid gap justifyContent="end">
                <Box>
                  <Button color={examRule._draft ? 'error' : 'primary'} type="cancel" variant="text">
                    {examRule._draft ? 'Descartar' : 'Cancelar'}
                  </Button>
                </Box>
                <Box>
                  <Button className="action-save-option" type="submit">
                    {examRule._draft ? 'Salvar Regra' : 'Atualizar Regra'}
                  </Button>
                </Box>
              </Grid>
            </>
          )}

          {!isEditing && questionRuleType === 'generate' && (
            <>
              <Divider mx="-1gap" my="1gap" />

              <Box center noWrap row>
                <Text flex variant="subtitle">
                  Categorias
                </Text>
                <Button
                  startAddon={({ color }) => <Icon color={color} name="Plus" />}
                  variant="outline"
                  onPress={() => setIsModalVisible(true)}
                >
                  Categoria
                </Button>
              </Box>

              {Boolean(examRule?.examRuleCategories?.length) && (
                <Grid gap mt="1gap">
                  {examRule?.examRuleCategories?.map((examRuleCategory) => (
                    <Box key={examRuleCategory.id}>
                      <Card row bg="background.secondary" py="0.5gap" shadow={0}>
                        <Text>
                          {Boolean(examRuleCategory.category?.parentId) && (
                            <Text variant="secondary">{examRuleCategory.category?.parent?.name} / </Text>
                          )}
                          <Text weight="500">{examRuleCategory.category?.name}</Text>
                        </Text>
                        <Box ml="0.5gap" mr="-1gap" my="-0.5gap">
                          <Tooltip title="Remover">
                            <Button
                              circular
                              color="error"
                              startAddon={({ color }) => <Icon color={color} name="X" />}
                              variant="text"
                              onPress={(e) => handleDeleteCategory(e, examRuleCategory.category.id)}
                            />
                          </Tooltip>
                        </Box>
                      </Card>
                    </Box>
                  ))}
                </Grid>
              )}

              <Divider mx="-1gap" my="1gap" />

              {!examRule?.examRuleCategories?.length && (
                <Text center color="warning" mb={1} variant="secondary">
                  Nenhuma categoria selecionada para filtrar.
                </Text>
              )}

              {number(examRule?.questionsCount) > number(count?.total) && (
                <Text center color="warning" mb={1} variant="secondary">
                  Não há questões suficientes para geração.
                </Text>
              )}

              {isLoadingCount ? (
                <Loading label="Verificando questões..." />
              ) : (
                <Text center color="success" weight="600">
                  {count?.total} {pluralize(number(count?.total), 'questão atende', 'questões atendem')} a regra.
                </Text>
              )}
            </>
          )}
        </Card>
      </Form>

      <Modal visible={isModalVisible} w={480} onClose={() => setIsModalVisible(false)}>
        <Form onSubmit={handleAddCategory}>
          <Text variant="subtitle">Associar Categoria</Text>

          <Divider mx="-1gap" my="1gap" />

          <InputFetch
            groupByAttr="parentId"
            groupByLabelAttr="parent.name"
            label="Categoria"
            name="categoryId"
            params={{ parentId: '*' }}
            url="/categories"
          />

          <Divider mx="-1gap" my="1gap" />

          <Grid gap row>
            <Box xs>
              <Button variant="outline" onPress={() => setIsModalVisible(false)}>
                Cancelar
              </Button>
            </Box>
            <Box xs>
              <Button type="submit">Adicionar</Button>
            </Box>
          </Grid>
        </Form>
      </Modal>
    </>
  );
}
