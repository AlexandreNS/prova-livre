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
                required: ['id', 'name', 'email'],
                properties: {
                  id: { type: 'number' },
                  name: { type: 'string' },
                  email: { type: 'string' },
                },
              },
              application: {
                type: 'object',
                required: ['id', 'exam'],
                properties: {
                  id: { type: 'number' },
                  startedAt: { type: 'string' },
                  endedAt: { type: 'string' },
                  exam: {
                    type: 'object',
                    required: ['name'],
                    properties: {
                      name: { type: 'string' },
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
      required: ['exam'],
      properties: {
        exam: {
          type: 'object',
          required: ['id', 'name'],
          properties: {
            name: { type: 'string' },
            minScore: { type: ['number', 'null'] },
            maxScore: { type: 'number' },
          },
        },
        studentApplication: {
          type: 'object',
          required: ['id', 'questions', 'startedAt', 'submittedAt', 'status', 'student'],
          properties: {
            id: { type: 'number' },
            startedAt: { type: ['string', 'null'] },
            submittedAt: { type: ['string', 'null'] },
            studentScore: { type: ['number', 'null'] },
            student: {
              type: 'object',
              required: ['id', 'name', 'email'],
              properties: {
                id: { type: 'number' },
                name: { type: 'string' },
                email: { type: 'string' },
              },
            },
            questions: {
              type: 'array',
              items: {
                type: 'object',
                required: [
                  'id',
                  'type',
                  'description',
                  'answer',
                  'correctOptionsCount',
                  'questionScore',
                  'studentScore',
                  'questionOptions',
                  'studentApplicationQuestionId',
                ],
                properties: {
                  id: { type: 'number' },
                  type: { type: 'string', enum: ['discursive', 'options'] },
                  description: { type: 'string' },
                  answer: { type: ['string', 'null'] },
                  correctOptionsCount: { type: ['number', 'null'] },
                  correctSelectedOptionsCount: { type: ['number', 'null'] },
                  questionScore: { type: 'number' },
                  studentApplicationQuestionId: { type: 'number' },
                  studentScore: { type: ['number', 'null'] },
                  feedback: { type: ['string', 'null'] },
                  correctionStatus: { type: 'string', enum: ['correct', 'partial', 'incorrect'] },
                  questionOptions: {
                    type: 'array',
                    items: {
                      type: 'object',
                      required: ['id', 'description'],
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

export const CorrectionDeleteSchema = {
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
    required: ['resetApplication'],
    properties: {
      resetApplication: { type: 'boolean' },
    },
  },
  response: {
    204: { type: 'null' },
  },
} as const satisfies SchemaFastify;
