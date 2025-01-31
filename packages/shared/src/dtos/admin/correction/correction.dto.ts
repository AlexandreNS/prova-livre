import type { SchemaFastify } from '@prova-livre/shared/types/schema.type';

import {
  PaginationSchemaProps,
  PaginationSchemaRequired,
  SearchSchemaProps,
} from '@prova-livre/shared/dtos/admin/util/util.dto';

export const CorrectionListSchema = {
  tags: ['admin/correction'],
  querystring: {
    type: 'object',
    properties: {
      ...SearchSchemaProps,
      ...PaginationSchemaProps,
      isCorrected: { type: 'number', enum: [0, 1] },
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
            required: ['id', 'startedAt', 'submittedAt', 'isCorrected', 'student', 'application'],
            properties: {
              id: { type: 'number' },
              startedAt: { type: 'string' },
              submittedAt: { type: 'string' },
              isCorrected: { type: 'boolean' },
              student: {
                type: 'object',
                required: ['id', 'name'],
                properties: {
                  id: { type: 'number' },
                  name: { type: 'string' },
                },
              },
              application: {
                type: 'object',
                required: ['id'],
                properties: {
                  id: { type: 'number' },
                  startedAt: { type: 'string' },
                  endedAt: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
  },
} as const satisfies SchemaFastify;

export const CorrectionGetSchema = {
  tags: ['admin/correction'],
  params: {
    type: 'object',
    required: ['studentApplicationId'],
    properties: {
      studentApplicationId: { type: 'number' },
    },
  },
  response: {
    200: {
      type: 'object',
      required: ['id', 'submittedAt', 'student', 'application'],
      properties: {
        id: { type: 'number' },
        startedAt: { type: 'string' },
        submittedAt: { type: 'string' },
        student: {
          type: 'object',
          required: ['id', 'name'],
          properties: {
            id: { type: 'number' },
            name: { type: 'string' },
          },
        },
        application: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'number' },
          },
        },
        studentApplicationQuestions: {
          type: 'array',
          items: {
            type: 'object',
            required: ['id', 'answer', 'questionScore', 'studentScore', 'question'],
            properties: {
              id: { type: 'number' },
              answer: { type: ['string', 'null'] },
              feedback: { type: ['string', 'null'] },
              questionScore: { type: 'number' },
              studentScore: { type: ['number', 'null'] },
              question: {
                type: 'object',
                required: ['id', 'type', 'description', 'questionOptions'],
                properties: {
                  id: { type: 'number' },
                  type: { type: 'string', enum: ['discursive', 'options'] },
                  description: { type: 'string' },
                  maxLength: { type: ['number', 'null'] },
                  questionOptions: {
                    type: 'array',
                    items: {
                      type: 'object',
                      required: ['id', 'description', 'isCorrect'],
                      properties: {
                        id: { type: 'number' },
                        description: { type: 'string' },
                        isCorrect: { type: 'boolean' },
                      },
                    },
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

export const CorrectionUpdateSchema = {
  tags: ['admin/correction'],
  params: {
    type: 'object',
    required: ['studentApplicationId'],
    properties: {
      studentApplicationId: { type: 'number' },
    },
  },
  body: {
    type: 'object',
    required: ['studentApplicationQuestionId', 'studentScore'],
    properties: {
      studentApplicationQuestionId: { type: 'number' },
      studentScore: { type: 'number' },
    },
  },
  response: {
    204: { type: 'null' },
  },
} as const satisfies SchemaFastify;
