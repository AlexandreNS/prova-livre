import type { SchemaFastify } from '@prova-livre/shared/types/schema.type';

import { CompanySchema, CompanyWithRoleSchema } from '@prova-livre/shared/dtos/admin/company/company.schema';
import { UserSchema } from '@prova-livre/shared/dtos/admin/user/user.schema';
import {
  PaginationSchemaProps,
  PaginationSchemaRequired,
  SearchSchemaProps,
} from '@prova-livre/shared/dtos/admin/util/util.dto';

export const CompanyListSchema = {
  tags: ['admin/company'],
  querystring: {
    type: 'object',
    properties: {},
  },
  response: {
    200: {
      type: 'array',
      items: CompanyWithRoleSchema,
    },
  },
} as const satisfies SchemaFastify;

export const CompanyGetSchema = {
  tags: ['admin/company'],
  params: {
    type: 'object',
    required: ['companyId'],
    properties: {
      companyId: { type: 'number' },
    },
  },
  response: {
    200: CompanyWithRoleSchema,
  },
} as const satisfies SchemaFastify;

export const CompanyCreateSchema = {
  tags: ['admin/company'],
  body: {
    type: 'object',
    required: ['name'],
    properties: {
      name: { type: 'string' },
    },
  },
  response: {
    200: CompanySchema,
  },
} as const satisfies SchemaFastify;

export const CompanyUpdateSchema = {
  tags: ['admin/company'],
  params: {
    type: 'object',
    required: ['companyId'],
    properties: {
      companyId: { type: 'number' },
    },
  },
  body: {
    type: 'object',
    required: ['name'],
    properties: {
      name: { type: 'string' },
    },
  },
  response: {
    200: CompanySchema,
  },
} as const satisfies SchemaFastify;

export const CompanyUserListSchema = {
  tags: ['admin/company'],
  querystring: {
    type: 'object',
    properties: {
      ...SearchSchemaProps,
      ...PaginationSchemaProps,
    },
  },
  params: {
    type: 'object',
    required: ['companyId'],
    properties: {
      companyId: { type: 'number' },
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
          items: UserSchema,
        },
      },
    },
  },
} as const satisfies SchemaFastify;
