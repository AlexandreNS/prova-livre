import type { SchemaFastify } from '@prova-livre/shared/types/schema.type';

import { CompanySchema } from '@prova-livre/shared/dtos/student/company/company.schema';

export const CompanyListSchema = {
  tags: ['student/company'],
  querystring: {
    type: 'object',
    properties: {},
  },
  response: {
    200: {
      type: 'array',
      items: CompanySchema,
    },
  },
} as const satisfies SchemaFastify;

export const CompanyGetSchema = {
  tags: ['student/company'],
  params: {
    type: 'object',
    required: ['companyId'],
    properties: {
      companyId: { type: 'number' },
    },
  },
  response: {
    200: CompanySchema,
  },
} as const satisfies SchemaFastify;

export const CompanyCreateSchema = {
  tags: ['student/company'],
  body: {
    type: 'object',
    required: ['name', 'user'],
    properties: {
      name: { type: 'string' },
      user: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' },
        },
      },
    },
  },
  response: {
    200: CompanySchema,
  },
} as const satisfies SchemaFastify;

export const CompanyUpdateSchema = {
  tags: ['student/company'],
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
