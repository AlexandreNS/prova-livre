import type { SchemaRoute } from '@prova-livre/shared/types/schema.type';

import { useState } from 'react';

import Icon from '@prova-livre/frontend/components/Icon';
import InputFetch from '@prova-livre/frontend/components/InputFetch';
import NoPermission from '@prova-livre/frontend/components/NoPermission';
import State from '@prova-livre/frontend/components/State';
import { confirm } from '@prova-livre/frontend/helpers/alert.helper';
import { getError } from '@prova-livre/frontend/helpers/api.helper';
import useAdminAuth from '@prova-livre/frontend/hooks/useAdminAuth';
import useIdParam from '@prova-livre/frontend/hooks/useIdParam';
import useRequest from '@prova-livre/frontend/hooks/useRequest';
import ApiAdmin from '@prova-livre/frontend/services/ApiAdmin';
import {
  QuestionCategoriesCreateSchema,
  type QuestionCategoriesListSchema,
} from '@prova-livre/shared/dtos/admin/question/question.dto';
import { hasPermissionList } from '@prova-livre/shared/helpers/feature.helper';
import { validate } from '@prova-livre/shared/helpers/form.helper';
import { type AnyObject, type RbkFormEvent, type RbkPointerEvent, useToaster } from '@react-bulk/core';
import { Box, Button, Card, Divider, Form, Grid, Modal, Text, Tooltip } from '@react-bulk/web';

export default function Page() {
  const { user } = useAdminAuth();
  const toaster = useToaster();
  const questionId = useIdParam('questionId');

  const [hasWritePermission] = hasPermissionList(user?.role, 'Question-Write');

  const [isModalAddVisible, setIsModalAddVisible] = useState(false);

  const {
    data: categories,
    revalidate,
    state,
  } = useRequest<SchemaRoute<typeof QuestionCategoriesListSchema>>(
    hasWritePermission && questionId && `/questions/${questionId}/categories`,
  );

  const handleAddCategory = async (e: RbkFormEvent, data: AnyObject) => {
    const errors = validate({
      formRef: e.form,
      data,
      schema: QuestionCategoriesCreateSchema.body,
    });

    e.form.setErrors(errors);
    if (errors) return;

    try {
      setIsModalAddVisible(false);
      await ApiAdmin.post(`/questions/${questionId}/categories`, data);
      await revalidate();
    } catch (err) {
      toaster.error(getError(err));
    }
  };

  const handleDeleteCategory = async (e: RbkPointerEvent, categoryId: number) => {
    if (!confirm('Deseja desassociar a categoria desta questão?')) {
      return;
    }

    try {
      await ApiAdmin.delete(`/questions/${questionId}/categories/${categoryId}`);
      await revalidate();
    } catch (err) {
      toaster.error(getError(err));
    }
  };

  if (!hasWritePermission) {
    return <NoPermission />;
  }

  return (
    <>
      {questionId && (
        <Box mt="1gap">
          <Button
            align="end"
            startAddon={({ color }) => <Icon color={color} name="Plus" />}
            variant="outline"
            onPress={() => setIsModalAddVisible(true)}
          >
            Categoria
          </Button>
        </Box>
      )}

      <State {...state}>
        <Card mt="1gap">
          {categories?.map((category, index) => {
            return (
              <Box key={category.id}>
                {index > 0 && <Divider mr="-1gap" my="1gap" />}

                <Grid noWrap row>
                  <Box flex>
                    <Text>
                      {Boolean(category.parentId) && <Text variant="secondary">{category.parent?.name} / </Text>}
                      <Text weight="500">{category.name}</Text>
                    </Text>
                  </Box>
                  <Box>
                    <Box noWrap row m="-0.5gap">
                      <Tooltip title="Remover">
                        <Button
                          circular
                          color="error"
                          startAddon={({ color }) => <Icon color={color} name="X" />}
                          variant="text"
                          onPress={(e) => handleDeleteCategory(e, category.id)}
                        />
                      </Tooltip>
                    </Box>
                  </Box>
                </Grid>
              </Box>
            );
          })}
        </Card>
      </State>

      <Modal visible={isModalAddVisible} w={480} onClose={() => setIsModalAddVisible(false)}>
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
