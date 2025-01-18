import type { SchemaQueryParams, SchemaResponse, SchemaRoute } from '@prova-livre/shared/types/schema.type';

import { useState } from 'react';
import { useDependentState } from 'react-state-hooks';

import Icon from '@prova-livre/frontend/components/Icon';
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
import { CategoryCreateSchema, CategoryListSchema } from '@prova-livre/shared/dtos/admin/category/category.dto';
import { hasPermissionList } from '@prova-livre/shared/helpers/feature.helper';
import { number } from '@prova-livre/shared/helpers/number.helper';
import { type AnyObject, type RbkFormEvent, type RbkPointerEvent, useToaster } from '@react-bulk/core';
import { Box, Button, Divider, Form, Grid, Input, Modal, Text, Tooltip } from '@react-bulk/web';
import { object } from 'dot-object';

export default function Page() {
  const { user } = useAdminAuth();
  const toaster = useToaster();
  const categoryId = useIdParam('categoryId');

  const [hasWritePermission] = hasPermissionList(user?.role, 'Category-Write');

  const [modelSubcategory, setModelSubcategory] = useState<SchemaResponse<typeof CategoryCreateSchema>>();

  const [subcategoriesParams, setSubcategoriesParams] = useDependentState<SchemaQueryParams<typeof CategoryListSchema>>(
    () => ({
      page: 1,
      parentId: number(categoryId),
    }),
    [categoryId],
  );

  const {
    data: subcategories,
    revalidate: revalidateSubcategories,
    state: subcategoriesState,
  } = useRequest<SchemaRoute<typeof CategoryListSchema>>(hasWritePermission && categoryId && `/categories`, {
    autoRevalidate: false,
    params: subcategoriesParams,
  });

  const handleSubmitSubcategory = async (e: RbkFormEvent, data: AnyObject) => {
    data = object(data);

    try {
      setModelSubcategory(undefined);
      await ApiAdmin.save('/categories', data.id, data);
      await revalidateSubcategories();
    } catch (err) {
      toaster.error(getError(err));
    }
  };

  const handleDeleteSubcategory = async (e: RbkPointerEvent, categoryId: number) => {
    if (!confirm('Deseja remover permanentemente a subcategoria?')) {
      return;
    }

    try {
      await ApiAdmin.delete(`/categories/${categoryId}`);
      await revalidateSubcategories();
    } catch (err) {
      toaster.error(getError(err));
    }
  };

  if (!hasWritePermission) {
    return <NoPermission />;
  }

  return (
    <>
      {categoryId && (
        <Box mt="1gap">
          <Button
            align="end"
            startAddon={({ color }) => <Icon color={color} name="Plus" />}
            variant="outline"
            // @ts-expect-error iniciar um model vazio
            onPress={() => setModelSubcategory({})}
          >
            Subcategoria
          </Button>
        </Box>
      )}

      <State {...subcategoriesState}>
        {subcategories?.rows?.map((subcat) => (
          <ListGroup
            key={subcat.id}
            data={[{ value: subcat.name }]}
            mt="1gap"
            right={
              <Box noWrap row m="-0.5gap">
                <Tooltip title="Editar">
                  <Button
                    circular
                    startAddon={({ color }) => <Icon color={color} name="Pencil" />}
                    variant="text"
                    onPress={() => setModelSubcategory(subcat)}
                  />
                </Tooltip>
                <Tooltip title="Remover">
                  <Button
                    circular
                    color="error"
                    startAddon={({ color }) => <Icon color={color} name="Trash" />}
                    variant="text"
                    onPress={(e) => handleDeleteSubcategory(e, subcat.id)}
                  />
                </Tooltip>
              </Box>
            }
          />
        ))}

        <Pagination
          {...subcategories}
          onChange={(data) => setSubcategoriesParams((current) => ({ ...current, ...data }))}
        />
      </State>

      <Modal visible={Boolean(modelSubcategory)} w={320} onClose={() => setModelSubcategory(undefined)}>
        <Form onSubmit={handleSubmitSubcategory}>
          {modelSubcategory?.id && <Input name="id" type="hidden" value={modelSubcategory?.id} />}

          <Input name="parentId" type="hidden" value={categoryId} />

          <Text variant="subtitle">Adicionar Subcategoria</Text>

          <Divider mx="-1gap" my="1gap" />

          <Input label="Nome" name="name" value={modelSubcategory?.name} />

          <Divider mx="-1gap" my="1gap" />

          <Grid gap row>
            <Box xs>
              <Button variant="outline" onPress={() => setModelSubcategory(undefined)}>
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
