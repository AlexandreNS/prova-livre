import type { SchemaBase } from '@prova-livre/shared/types/schema.type';

export const ApplicationSchema = {
  type: 'object',
  required: ['id', 'examId', 'startedAt', 'endedAt', 'attempts', 'limitTime', 'showAnswers'],
  properties: {
    id: { type: 'number' },
    examId: { type: 'number' },
    startedAt: { type: 'string' },
    endedAt: { type: 'string' },
    attempts: { type: 'integer', minimum: 1 },
    limitTime: { type: ['number', 'null'] },
    showAnswers: { type: 'boolean' },
    showScores: { type: 'boolean' },
    exam: {
      type: 'object',
      required: ['id', 'name'],
      properties: {
        id: { type: 'number' },
        name: { type: 'string' },
      },
    },
  },
} as const satisfies SchemaBase;
