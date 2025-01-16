import type { SchemaFastify } from '@prova-livre/shared/types/schema.type';

import { CategorySchema } from '@prova-livre/shared/dtos/admin/category/category.schema';
import {
  PaginationSchemaProps,
  PaginationSchemaRequired,
  SearchSchemaProps,
} from '@prova-livre/shared/dtos/admin/util/util.dto';

export const CategoryListSchema = {
  tags: ['admin/category'],
  querystring: {
    type: 'object',
    properties: {
      ...SearchSchemaProps,
      ...PaginationSchemaProps,
      parentId: {
        oneOf: [{ type: 'null' }, { type: 'number' }, { type: 'string', enum: ['*'] }],
      },
    },
  },
  response: {
    200: {
      type: 'object',
      required: PaginationSchemaRequired,
      properties: {
        ...PaginationSchemaProps,
        rows: {
          type: 'array',
          items: CategorySchema,
        },
      },
    },
  },
} as const satisfies SchemaFastify;

export const CategoryGetSchema = {
  tags: ['admin/category'],
  params: {
    type: 'object',
    required: ['categoryId'],
    properties: {
      categoryId: { type: 'number' },
    },
  },
  response: {
    200: CategorySchema,
  },
} as const satisfies SchemaFastify;

export const CategoryCreateSchema = {
  tags: ['admin/category'],
  body: {
    type: 'object',
    required: ['name'],
    properties: {
      name: { type: 'string' },
      allowMultipleSelection: { type: 'boolean' },
      parentId: { type: 'number' },
    },
  },
  response: {
    200: CategorySchema,
  },
} as const satisfies SchemaFastify;

export const CategoryUpdateSchema = {
  tags: ['admin/category'],
  params: {
    type: 'object',
    required: ['categoryId'],
    properties: {
      categoryId: { type: 'number' },
    },
  },
  body: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      allowMultipleSelection: { type: 'boolean' },
    },
  },
  response: {
    200: CategorySchema,
  },
} as const satisfies SchemaFastify;

export const CategoryDeleteSchema = {
  tags: ['admin/category'],
  params: {
    type: 'object',
    required: ['categoryId'],
    properties: {
      categoryId: { type: 'number' },
    },
  },
  response: {
    204: { type: 'null' },
  },
} as const satisfies SchemaFastify;
