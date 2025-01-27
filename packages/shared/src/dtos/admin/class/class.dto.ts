import type { SchemaFastify } from '@prova-livre/shared/types/schema.type';

import { ClassSchema } from '@prova-livre/shared/dtos/admin/class/class.schema';
import {
  PaginationSchemaProps,
  PaginationSchemaRequired,
  SearchSchemaProps,
} from '@prova-livre/shared/dtos/admin/util/util.dto';

export const ClassListSchema = {
  tags: ['admin/class'],
  querystring: {
    type: 'object',
    properties: {
      ...SearchSchemaProps,
      ...PaginationSchemaProps,
      applicationId: { type: 'number' },
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
          items: ClassSchema,
        },
      },
    },
  },
} as const satisfies SchemaFastify;

export const ClassGetSchema = {
  tags: ['admin/class'],
  params: {
    type: 'object',
    required: ['classId'],
    properties: {
      classId: { type: 'number' },
    },
  },
  response: {
    200: ClassSchema,
  },
} as const satisfies SchemaFastify;

export const ClassCreateSchema = {
  tags: ['admin/class'],
  body: {
    type: 'object',
    required: ['name'],
    properties: {
      name: { type: 'string' },
      description: { type: 'string' },
    },
  },
  response: {
    200: ClassSchema,
  },
} as const satisfies SchemaFastify;

export const ClassUpdateSchema = {
  tags: ['admin/class'],
  params: {
    type: 'object',
    required: ['classId'],
    properties: {
      classId: { type: 'number' },
    },
  },
  body: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      description: { type: 'string' },
    },
  },
  response: {
    200: ClassSchema,
  },
} as const satisfies SchemaFastify;

export const ClassDeleteSchema = {
  tags: ['admin/class'],
  params: {
    type: 'object',
    required: ['classId'],
    properties: {
      classId: { type: 'number' },
    },
  },
  response: {
    204: { type: 'null' },
  },
} as const satisfies SchemaFastify;

export const ClassStudentsCreateSchema = {
  tags: ['admin/class'],
  params: {
    type: 'object',
    required: ['classId'],
    properties: {
      classId: { type: 'number' },
    },
  },
  body: {
    type: 'object',
    required: ['studentId'],
    properties: {
      studentId: { type: 'number' },
    },
  },
  response: {
    204: { type: 'null' },
  },
} as const satisfies SchemaFastify;

export const ClassStudentsDeleteSchema = {
  tags: ['admin/class'],
  params: {
    type: 'object',
    required: ['classId', 'studentId'],
    properties: {
      classId: { type: 'number' },
      studentId: { type: 'number' },
    },
  },
  response: {
    204: { type: 'null' },
  },
} as const satisfies SchemaFastify;
