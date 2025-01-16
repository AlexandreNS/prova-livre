import type { CategoryListSchema } from '@prova-livre/shared/dtos/admin/category/category.dto';
import type { SchemaQueryParams, SchemaRoute } from '@prova-livre/shared/types/schema.type';

import Icon from '@prova-livre/frontend/components/Icon';
import LinkChild from '@prova-livre/frontend/components/LinkChild';
import ListGroup from '@prova-livre/frontend/components/ListGroup';
import NoPermission from '@prova-livre/frontend/components/NoPermission';
import PageHeader from '@prova-livre/frontend/components/PageHeader';
import Pagination from '@prova-livre/frontend/components/Pagination';
import State from '@prova-livre/frontend/components/State';
import { confirm } from '@prova-livre/frontend/helpers/alert.helper';
import { getError } from '@prova-livre/frontend/helpers/api.helper';
import useAdminAuth from '@prova-livre/frontend/hooks/useAdminAuth';
import useQueryParams from '@prova-livre/frontend/hooks/useQueryParams';
import useRequest from '@prova-livre/frontend/hooks/useRequest';
import ApiAdmin from '@prova-livre/frontend/services/ApiAdmin';
import { hasPermissionList } from '@prova-livre/shared/helpers/feature.helper';
import { type RbkPointerEvent, useToaster } from '@react-bulk/core';
import { Box, Button, Tooltip } from '@react-bulk/web';

export default function Page() {
  const { user } = useAdminAuth();
  const toaster = useToaster();

  const [hasReadPermission, hasWritePermission, hasDeletePermission] = hasPermissionList(
    user?.role,
    'Category-Read',
    'Category-Write',
    'Category-Delete',
  );

  const [params, updateParams] = useQueryParams<SchemaQueryParams<typeof CategoryListSchema>>({
    page: 1,
  });

  const {
    data: categories,
    revalidate: revalidateCategories,
    state,
  } = useRequest<SchemaRoute<typeof CategoryListSchema>>(hasReadPermission && '/categories', { params });

  const handleDeleteCategory = async (_: RbkPointerEvent, categoryId: number) => {
    if (!confirm('Deseja remover permanentemente a categoria?')) {
      return;
    }

    try {
      await ApiAdmin.delete(`/categories/${categoryId}`);
      await revalidateCategories();
    } catch (err) {
      toaster.error(getError(err));
    }
  };

  if (!hasReadPermission) {
    return <NoPermission />;
  }

  return (
    <>
      <PageHeader title="Categorias" onSearch={(search) => updateParams({ search })}>
        {hasWritePermission && (
          <LinkChild href="/admin/categories/add/basic">
            <Button>Adicionar</Button>
          </LinkChild>
        )}
      </PageHeader>

      <State {...state}>
        {categories?.rows.map((category) => (
          <ListGroup
            key={category.id}
            mt="1gap"
            data={[
              {
                minw: 100,
                label: 'ID',
                value: category.id,
              },
              {
                xs: 12,
                md: 'flex',
                label: 'Nome',
                value: category.name,
              },
            ]}
            right={
              <Box noWrap m="-0.5gap" style={{ md: { flexDirection: 'row' } }}>
                <Tooltip title="Ver">
                  <LinkChild href={`/admin/categories/${category.id}`}>
                    <Button
                      circular
                      startAddon={({ color }) => <Icon color={color} name="CaretRight" />}
                      variant="text"
                    />
                  </LinkChild>
                </Tooltip>
                {hasDeletePermission && (
                  <Tooltip title="Editar">
                    <LinkChild href={`/admin/categories/${category.id}/basic`}>
                      <Button
                        circular
                        startAddon={({ color }) => <Icon color={color} name="Pencil" />}
                        variant="text"
                      />
                    </LinkChild>
                  </Tooltip>
                )}
                {hasDeletePermission && (
                  <Tooltip title="Remover">
                    <Button
                      circular
                      color="error"
                      startAddon={({ color }) => <Icon color={color} name="Trash" />}
                      variant="text"
                      onPress={(e) => handleDeleteCategory(e, category.id)}
                    />
                  </Tooltip>
                )}
              </Box>
            }
          />
        ))}

        <Pagination {...categories} onChange={updateParams} />
      </State>
    </>
  );
}
