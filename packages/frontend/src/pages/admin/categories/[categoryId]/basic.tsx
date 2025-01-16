import type { SchemaRoute } from '@prova-livre/shared/types/schema.type';

import NoPermission from '@prova-livre/frontend/components/NoPermission';
import State from '@prova-livre/frontend/components/State';
import { getError } from '@prova-livre/frontend/helpers/api.helper';
import useAdminAuth from '@prova-livre/frontend/hooks/useAdminAuth';
import useIdParam from '@prova-livre/frontend/hooks/useIdParam';
import useRequest from '@prova-livre/frontend/hooks/useRequest';
import { useNavigate } from '@prova-livre/frontend/router';
import ApiAdmin from '@prova-livre/frontend/services/ApiAdmin';
import { CategoryCreateSchema, type CategoryGetSchema } from '@prova-livre/shared/dtos/admin/category/category.dto';
import { hasPermissionList } from '@prova-livre/shared/helpers/feature.helper';
import { validate } from '@prova-livre/shared/helpers/form.helper';
import { type AnyObject, type RbkFormEvent, useToaster } from '@react-bulk/core';
import { Box, Button, Card, Checkbox, Form, Grid, Input, Text } from '@react-bulk/web';
import { object } from 'dot-object';

export default function Page() {
  const { user } = useAdminAuth();
  const toaster = useToaster();
  const navigate = useNavigate();
  const categoryId = useIdParam('categoryId');

  const [hasWritePermission] = hasPermissionList(user?.role, 'Category-Write');

  const { data: category, state } = useRequest<SchemaRoute<typeof CategoryGetSchema>>(
    hasWritePermission && categoryId && `/categories/${categoryId}`,
    {
      noCache: true,
      autoRevalidate: false,
    },
  );

  const handleSubmitCategory = async (e: RbkFormEvent, data: AnyObject) => {
    data = object(data);

    const errors = validate({
      formRef: e.form,
      data,
      schema: CategoryCreateSchema.body,
    });

    e.form.setErrors(errors);
    if (errors) return;

    try {
      const response = await ApiAdmin.save('/categories', categoryId, data);

      navigate('/admin/categories/:categoryId', {
        params: { categoryId: response.data.id },
      });

      toaster.success('Os dados foram salvos.');
    } catch (err) {
      toaster.error(getError(err));
    }
  };

  if (!hasWritePermission) {
    return <NoPermission />;
  }

  return (
    <>
      <State {...(categoryId ? state : {})}>
        <Form onSubmit={handleSubmitCategory}>
          <Card mt="1gap">
            <Grid gap>
              <Box xs={12}>
                <Input required label="Nome" name="name" value={category?.name} />
              </Box>
              <Box xs={12}>
                <Checkbox
                  checked={category?.allowMultipleSelection}
                  label="Permitir seleção de múltiplas subcategorias"
                  name="allowMultipleSelection"
                />
                <Text color="text.secondary" variant="caption">
                  Marcar esta opção permite que sejam selecionadas várias subcategorias no cadastro de questões.
                </Text>
              </Box>
            </Grid>
          </Card>

          <Box mt="1gap">
            <Button align="end" type="submit">
              Salvar
            </Button>
          </Box>
        </Form>
      </State>
    </>
  );
}
