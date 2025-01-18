import type { SchemaFastify } from '@prova-livre/shared/types/schema.type';

import { StudentSchema } from '@prova-livre/shared/dtos/admin/student/student.schema';
import {
  PaginationSchemaProps,
  PaginationSchemaRequired,
  SearchSchemaProps,
} from '@prova-livre/shared/dtos/admin/util/util.dto';

export const StudentListSchema = {
  tags: ['admin/student'],
  querystring: {
    type: 'object',
    properties: {
      ...SearchSchemaProps,
      ...PaginationSchemaProps,
      classId: { type: 'number' },
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
          items: StudentSchema,
        },
      },
    },
  },
} as const satisfies SchemaFastify;

export const StudentGetSchema = {
  tags: ['admin/student'],
  params: {
    type: 'object',
    required: ['studentId'],
    properties: {
      studentId: { type: 'number' },
    },
  },
  response: {
    200: StudentSchema,
  },
} as const satisfies SchemaFastify;

export const StudentCreateSchema = {
  tags: ['admin/student'],
  body: {
    type: 'object',
    required: ['email'],
    properties: {
      name: { type: 'string' },
      email: { type: 'string', format: 'email' },
    },
  },
  response: {
    200: StudentSchema,
  },
} as const satisfies SchemaFastify;

export const StudentUpdateSchema = {
  tags: ['admin/student'],
  params: {
    type: 'object',
    required: ['studentId'],
    properties: {
      studentId: { type: 'number' },
    },
  },
  body: {
    type: 'object',
    required: ['email'],
    properties: {
      name: { type: 'string' },
      email: { type: 'string', format: 'email' },
    },
  },
  response: {
    200: StudentSchema,
  },
} as const satisfies SchemaFastify;

export const StudentDeleteSchema = {
  tags: ['admin/student'],
  params: {
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
