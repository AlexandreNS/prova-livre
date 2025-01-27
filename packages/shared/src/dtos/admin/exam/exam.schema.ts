import type { SchemaBase } from '@prova-livre/shared/types/schema.type';

import { CategorySchema } from '@prova-livre/shared/dtos/admin/category/category.schema';

export const ExamSchema = {
  type: 'object',
  required: ['id', 'name', 'title', 'description', 'minScore', 'maxScore'],
  properties: {
    id: { type: 'number' },
    name: { type: 'string' },
    title: { type: ['string', 'null'] },
    description: { type: ['string', 'null'] },
    minScore: { type: ['number', 'null'] },
    maxScore: { type: ['number', 'null'] },
  },
} as const satisfies SchemaBase;

export const ExamRuleSchema = {
  type: 'object',
  required: ['id', 'score', 'questionsCount', 'examId', 'questionId'],
  properties: {
    id: { type: 'number' },
    score: { type: ['number', 'null'] },
    questionsCount: { type: 'number' },
    questionType: { type: ['string', 'null'], enum: ['discursive', 'options'] },
    examId: { type: 'number' },
    questionId: { type: ['number', 'null'] },
    examRuleCategories: {
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
} as const satisfies SchemaBase;
