import type { SchemaFastify } from '@prova-livre/shared/types/schema.type';

import { CategorySchema } from '@prova-livre/shared/dtos/admin/category/category.schema';
import { ExamRuleSchema, ExamSchema } from '@prova-livre/shared/dtos/admin/exam/exam.schema';
import {
  PaginationSchemaProps,
  PaginationSchemaRequired,
  SearchSchemaProps,
} from '@prova-livre/shared/dtos/admin/util/util.dto';

export const ExamListSchema = {
  tags: ['admin/exam'],
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
          items: ExamSchema,
        },
      },
    },
  },
} as const satisfies SchemaFastify;

export const ExamGetSchema = {
  tags: ['admin/exam'],
  params: {
    type: 'object',
    required: ['examId'],
    properties: {
      examId: { type: 'number' },
    },
  },
  response: {
    200: ExamSchema,
  },
} as const satisfies SchemaFastify;

export const ExamCreateSchema = {
  tags: ['admin/exam'],
  body: {
    type: 'object',
    required: ['name'],
    properties: {
      name: { type: 'string' },
      title: { type: ['string', 'null'] },
      description: { type: ['string', 'null'] },
      minScore: { type: ['number', 'null'], minimum: 0 },
      maxScore: { type: ['number', 'null'], minimum: 0 },
    },
  },
  response: {
    200: ExamSchema,
  },
} as const satisfies SchemaFastify;

export const ExamUpdateSchema = {
  tags: ['admin/exam'],
  params: {
    type: 'object',
    required: ['examId'],
    properties: {
      examId: { type: 'number' },
    },
  },
  body: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      title: { type: ['string', 'null'] },
      description: { type: ['string', 'null'] },
      minScore: { type: ['number', 'null'], minimum: 0 },
      maxScore: { type: ['number', 'null'], minimum: 0 },
    },
  },
  response: {
    200: ExamSchema,
  },
} as const satisfies SchemaFastify;

export const ExamDeleteSchema = {
  tags: ['admin/exam'],
  params: {
    type: 'object',
    required: ['examId'],
    properties: {
      examId: { type: 'number' },
    },
  },
  response: {
    204: { type: 'null' },
  },
} as const satisfies SchemaFastify;

export const ExamRulesListSchema = {
  tags: ['admin/exam'],
  params: {
    type: 'object',
    required: ['examId'],
    properties: {
      examId: { type: 'number' },
    },
  },
  response: {
    200: {
      type: 'array',
      items: ExamRuleSchema,
    },
  },
} as const satisfies SchemaFastify;

export const ExamRulesCreateSchema = {
  tags: ['admin/exam'],
  params: {
    type: 'object',
    required: ['examId'],
    properties: {
      examId: { type: 'number' },
    },
  },
  body: {
    type: 'object',
    required: ['score'],
    properties: {
      questionsCount: { type: 'number' },
      score: { type: 'number', minimum: 0 },
      questionId: { type: ['number', 'null'] },
      questionType: {
        type: ['string', 'null'],
        enum: ['discursive', 'options', null],
      },
    },
  },
  response: {
    200: ExamRuleSchema,
  },
} as const satisfies SchemaFastify;

export const ExamRulesUpdateSchema = {
  tags: ['admin/exam'],
  params: {
    type: 'object',
    required: ['examId', 'examRuleId'],
    properties: {
      examId: { type: 'number' },
      examRuleId: { type: 'number' },
    },
  },
  body: {
    type: 'object',
    properties: {
      questionsCount: { type: 'number' },
      score: { type: 'number', minimum: 0 },
      questionId: { type: ['number', 'null'] },
      questionType: {
        oneOf: [{ type: 'string', enum: ['discursive', 'options'] }, { type: 'null' }],
      },
    },
  },
  response: {
    200: ExamRuleSchema,
  },
} as const satisfies SchemaFastify;

export const ExamRulesDeleteSchema = {
  tags: ['admin/exam'],
  params: {
    type: 'object',
    required: ['examId', 'examRuleId'],
    properties: {
      examId: { type: 'number' },
      examRuleId: { type: 'number' },
    },
  },
  response: {
    204: { type: 'null' },
  },
} as const satisfies SchemaFastify;

export const ExamRulesCountSchema = {
  tags: ['admin/exam'],
  params: {
    type: 'object',
    required: ['examId', 'examRuleId'],
    properties: {
      examId: { type: 'number' },
      examRuleId: { type: 'number' },
    },
  },
  response: {
    200: {
      type: 'object',
      required: ['total'],
      properties: {
        total: { type: 'number' },
      },
    },
  },
} as const satisfies SchemaFastify;

export const ExamRuleCategoriesListSchema = {
  tags: ['admin/exam'],
  params: {
    type: 'object',
    required: ['examId', 'examRuleId'],
    properties: {
      examId: { type: 'number' },
      examRuleId: { type: 'number' },
    },
  },
  response: {
    200: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'category'],
        properties: {
          id: { type: 'number' },
          category: CategorySchema,
        },
      },
    },
  },
} as const satisfies SchemaFastify;

export const ExamRuleCategoriesActionSchema = {
  tags: ['admin/exam'],
  params: {
    type: 'object',
    required: ['examId', 'examRuleId', 'categoryId'],
    properties: {
      examId: { type: 'number' },
      examRuleId: { type: 'number' },
      categoryId: { type: 'number' },
    },
  },
  response: {
    204: {
      type: 'object',
      required: ['id', 'category'],
      properties: {
        id: { type: 'number' },
        category: CategorySchema,
      },
    },
  },
} as const satisfies SchemaFastify;
