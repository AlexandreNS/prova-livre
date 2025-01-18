import type { SchemaBase } from '@prova-livre/shared/types/schema.type';

export const ClassSchema = {
  type: 'object',
  required: ['id', 'name'],
  properties: {
    id: { type: 'number' },
    name: { type: 'string' },
    description: { type: 'string' },
  },
} as const satisfies SchemaBase;

export const ClassStudentSchema = {
  type: 'object',
  required: ['classId', 'studentId'],
  properties: {
    classId: { type: 'number' },
    studentId: { type: 'number' },
  },
} as const satisfies SchemaBase;
