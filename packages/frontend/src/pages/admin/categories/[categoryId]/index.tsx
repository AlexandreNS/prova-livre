import type { SchemaQueryParams, SchemaRoute } from '@prova-livre/shared/types/schema.type';

import { useDependentState } from 'react-state-hooks';

import ListGroup from '@prova-livre/frontend/components/ListGroup';
import NoPermission from '@prova-livre/frontend/components/NoPermission';
import Pagination from '@prova-livre/frontend/components/Pagination';
import State from '@prova-livre/frontend/components/State';
import useAdminAuth from '@prova-livre/frontend/hooks/useAdminAuth';
import useIdParam from '@prova-livre/frontend/hooks/useIdParam';
import useRequest from '@prova-livre/frontend/hooks/useRequest';
import { type CategoryGetSchema, CategoryListSchema } from '@prova-livre/shared/dtos/admin/category/category.dto';
import { hasPermissionList } from '@prova-livre/shared/helpers/feature.helper';
import { number } from '@prova-livre/shared/helpers/number.helper';
import { Text } from '@react-bulk/web';

export default function Page() {
  const { user } = useAdminAuth();
  const categoryId = useIdParam('categoryId');

  const [hasReadPermission] = hasPermissionList(user?.role, 'Category-Read', 'Category-Write');

  const [subcategoriesParams, setSubcategoriesParams] = useDependentState<SchemaQueryParams<typeof CategoryListSchema>>(
    () => ({
      page: 1,
      parentId: number(categoryId),
    }),
    [categoryId],
  );

  const { data: category, state } = useRequest<SchemaRoute<typeof CategoryGetSchema>>(
    hasReadPermission && categoryId && `/categories/${categoryId}`,
  );

  const { data: subcategories, state: subcategoriesState } = useRequest<SchemaRoute<typeof CategoryListSchema>>(
    hasReadPermission && categoryId && `/categories`,
    { params: subcategoriesParams },
  );

  if (!hasReadPermission) {
    return <NoPermission />;
  }

  return (
    <>
      <State {...state}>
        <ListGroup
          mt="1gap"
          data={[
            { label: 'Nome', value: category?.name },
            'break',
            {
              value: `${category?.allowMultipleSelection ? 'Permite' : 'Não permite'} a seleção de múltiplas subcategorias`,
            },
          ]}
        />

        <Text mt="2gap" variant="subtitle">
          Subcategorias
        </Text>
        <State {...subcategoriesState}>
          <ListGroup
            breakAll
            mt="1gap"
            data={subcategories?.rows?.map((subcat) => ({
              value: subcat.name,
            }))}
          />

          <Pagination
            {...subcategories}
            plural="subcategorias"
            singular="subcategoria"
            onChange={(data) => setSubcategoriesParams((current) => ({ ...current, ...data }))}
          />
        </State>
      </State>
    </>
  );
}
