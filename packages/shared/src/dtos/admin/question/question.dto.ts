import type { SchemaFastify } from '@prova-livre/shared/types/schema.type';

import { CategorySchema } from '@prova-livre/shared/dtos/admin/category/category.schema';
import { QuestionOptionSchema, QuestionSchema } from '@prova-livre/shared/dtos/admin/question/question.schema';
import {
  PaginationSchemaProps,
  PaginationSchemaRequired,
  SearchSchemaProps,
} from '@prova-livre/shared/dtos/admin/util/util.dto';

export const QuestionListSchema = {
  tags: ['admin/question'],
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
          items: QuestionSchema,
        },
      },
    },
  },
} as const satisfies SchemaFastify;

export const QuestionGetSchema = {
  tags: ['admin/question'],
  params: {
    type: 'object',
    required: ['questionId'],
    properties: {
      questionId: { type: 'number' },
    },
  },
  response: {
    200: QuestionSchema,
  },
} as const satisfies SchemaFastify;

export const QuestionCreateSchema = {
  tags: ['admin/question'],
  body: {
    type: 'object',
    required: ['type', 'description'],
    properties: {
      description: { type: 'string' },
      type: { type: 'string', enum: ['discursive', 'options'] },
      maxLength: { type: ['number', 'null'] },
    },
  },
  response: {
    200: QuestionSchema,
  },
} as const satisfies SchemaFastify;

export const QuestionUpdateSchema = {
  tags: ['admin/question'],
  params: {
    type: 'object',
    required: ['questionId'],
    properties: {
      questionId: { type: 'number' },
    },
  },
  body: {
    type: 'object',
    properties: {
      description: { type: 'string' },
      type: { type: 'string', enum: ['discursive', 'options'] },
      maxLength: { type: ['number', 'null'] },
    },
  },
  response: {
    200: QuestionSchema,
  },
} as const satisfies SchemaFastify;

export const QuestionDeleteSchema = {
  tags: ['admin/question'],
  params: {
    type: 'object',
    required: ['questionId'],
    properties: {
      questionId: { type: 'number' },
    },
  },
  response: {
    204: { type: 'null' },
  },
} as const satisfies SchemaFastify;

export const QuestionOptionsListSchema = {
  tags: ['admin/question'],
  params: {
    type: 'object',
    required: ['questionId'],
    properties: {
      questionId: { type: 'number' },
    },
  },
  response: {
    200: {
      type: 'array',
      items: QuestionOptionSchema,
    },
  },
} as const satisfies SchemaFastify;

export const QuestionOptionsCreateSchema = {
  tags: ['admin/question'],
  params: {
    type: 'object',
    required: ['questionId'],
    properties: {
      questionId: { type: 'number' },
    },
  },
  body: {
    type: 'object',
    required: ['description', 'isCorrect'],
    properties: {
      description: { type: 'string' },
      isCorrect: { type: 'boolean' },
    },
  },
  response: {
    204: QuestionOptionSchema,
  },
} as const satisfies SchemaFastify;

export const QuestionOptionsUpdateSchema = {
  tags: ['admin/question'],
  params: {
    type: 'object',
    required: ['questionId', 'optionId'],
    properties: {
      questionId: { type: 'number' },
      optionId: { type: 'number' },
    },
  },
  body: {
    type: 'object',
    properties: {
      description: { type: 'string' },
      isCorrect: { type: 'boolean' },
    },
  },
  response: {
    204: { type: 'null' },
  },
} as const satisfies SchemaFastify;

export const QuestionOptionsDeleteSchema = {
  tags: ['admin/question'],
  params: {
    type: 'object',
    required: ['questionId', 'optionId'],
    properties: {
      questionId: { type: 'number' },
      optionId: { type: 'number' },
    },
  },
  response: {
    204: { type: 'null' },
  },
} as const satisfies SchemaFastify;

export const QuestionCategoriesListSchema = {
  tags: ['admin/question'],
  params: {
    type: 'object',
    required: ['questionId'],
    properties: {
      questionId: { type: 'number' },
    },
  },
  response: {
    200: {
      type: 'array',
      items: CategorySchema,
    },
  },
} as const satisfies SchemaFastify;

export const QuestionCategoriesCreateSchema = {
  tags: ['admin/question'],
  params: {
    type: 'object',
    required: ['questionId'],
    properties: {
      questionId: { type: 'number' },
    },
  },
  body: {
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

export const QuestionCategoriesDeleteSchema = {
  tags: ['admin/question'],
  params: {
    type: 'object',
    required: ['questionId', 'categoryId'],
    properties: {
      questionId: { type: 'number' },
      categoryId: { type: 'number' },
    },
  },
  response: {
    204: { type: 'null' },
  },
} as const satisfies SchemaFastify;
