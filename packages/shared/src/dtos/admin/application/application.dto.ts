import type { SchemaFastify } from '@prova-livre/shared/types/schema.type';

import { StudentApplicationStatus } from '@prova-livre/shared/constants/StudentApplicationStatus';
import { ApplicationSchema } from '@prova-livre/shared/dtos/admin/application/application.schema';
import {
  PaginationSchemaProps,
  PaginationSchemaRequired,
  SearchSchemaProps,
} from '@prova-livre/shared/dtos/admin/util/util.dto';

export const ApplicationListSchema = {
  tags: ['admin/application'],
  querystring: {
    type: 'object',
    properties: {
      ...SearchSchemaProps,
      ...PaginationSchemaProps,
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
          items: ApplicationSchema,
        },
      },
    },
  },
} as const satisfies SchemaFastify;

export const ApplicationGetSchema = {
  tags: ['admin/application'],
  params: {
    type: 'object',
    required: ['applicationId'],
    properties: {
      applicationId: { type: ['number'] },
    },
  },
  response: {
    200: ApplicationSchema,
  },
} as const satisfies SchemaFastify;

export const ApplicationCreateSchema = {
  tags: ['admin/application'],
  body: {
    type: 'object',
    required: ['examId', 'startedAt', 'endedAt', 'attempts'],
    properties: {
      examId: { type: 'number' },
      startedAt: { type: 'string' },
      endedAt: { type: 'string' },
      attempts: { type: 'integer', minimum: 1 },
      limitTime: { type: ['number', 'null'] },
      showAnswers: { type: 'boolean' },
      showScores: { type: 'boolean' },
    },
  },
  response: {
    200: ApplicationSchema,
  },
} as const satisfies SchemaFastify;

export const ApplicationUpdateSchema = {
  tags: ['admin/application'],
  params: {
    type: 'object',
    required: ['applicationId'],
    properties: {
      applicationId: { type: 'number' },
    },
  },
  body: {
    type: 'object',
    properties: {
      examId: { type: 'number' },
      startedAt: { type: 'string' },
      endedAt: { type: 'string' },
      attempts: { type: 'integer', minimum: 1 },
      limitTime: { type: ['number', 'null'] },
      showAnswers: { type: 'boolean' },
      showScores: { type: 'boolean' },
    },
  },
  response: {
    200: ApplicationSchema,
  },
} as const satisfies SchemaFastify;

export const ApplicationDeleteSchema = {
  tags: ['admin/application'],
  params: {
    type: 'object',
    required: ['applicationId'],
    properties: {
      applicationId: { type: 'number' },
    },
  },
  response: {
    204: { type: 'null' },
  },
} as const satisfies SchemaFastify;

export const ApplicationStudentsListSchema = {
  tags: ['admin/application'],
  querystring: {
    type: 'object',
    properties: {
      ...SearchSchemaProps,
      ...PaginationSchemaProps,
    },
  },
  params: {
    type: 'object',
    required: ['applicationId'],
    properties: {
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
          items: {
            type: 'object',
            required: ['id', 'name', 'email'],
            properties: {
              id: { type: 'number' },
              name: { type: 'string' },
              email: { type: 'string', format: 'email' },
              studentApplicationResult: {
                type: ['array', 'null'],
                items: {
                  type: 'object',
                  properties: {
                    id: { type: ['number', 'null'] },
                    status: { type: 'string', enum: Object.values(StudentApplicationStatus) },
                    startedAt: { type: ['string', 'null'] },
                    submittedAt: { type: ['string', 'null'] },
                    studentScore: { type: ['number', 'null'] },
                    maxScore: { type: ['number', 'null'] },
                    minScore: { type: ['number', 'null'] },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
} as const satisfies SchemaFastify;

export const ApplicationStudentsCreateSchema = {
  tags: ['admin/application'],
  params: {
    type: 'object',
    required: ['applicationId'],
    properties: {
      applicationId: { type: 'number' },
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

export const ApplicationClassesCreateSchema = {
  tags: ['admin/application'],
  params: {
    type: 'object',
    required: ['applicationId'],
    properties: {
      applicationId: { type: 'number' },
    },
  },
  body: {
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

export const ApplicationClassesDeleteSchema = {
  tags: ['admin/application'],
  params: {
    type: 'object',
    required: ['applicationId', 'classId'],
    properties: {
      applicationId: { type: 'number' },
      classId: { type: 'number' },
    },
  },
  response: {
    204: { type: 'null' },
  },
} as const satisfies SchemaFastify;
