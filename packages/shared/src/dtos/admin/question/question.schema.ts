import type { SchemaBase } from '@prova-livre/shared/types/schema.type';

export const QuestionSchema = {
  type: 'object',
  required: ['id', 'description', 'type', 'maxLength'],
  properties: {
    id: { type: 'number' },
    description: { type: 'string' },
    type: { type: 'string', enum: ['discursive', 'options'] },
    maxLength: { type: ['number', 'null'] },
    enabled: { type: 'boolean' },
  },
} as const satisfies SchemaBase;

export const QuestionOptionSchema = {
  type: 'object',
  required: ['id', 'description', 'isCorrect'],
  properties: {
    id: { type: 'number' },
    description: { type: 'string' },
    isCorrect: { type: 'boolean' },
  },
} as const satisfies SchemaBase;
