import type { SchemaBase } from '@prova-livre/shared/types/schema.type';

export const MeSchema = {
  type: 'object',
  required: ['id', 'name', 'email'],
  properties: {
    id: { type: 'number' },
    name: { type: 'string' },
    email: { type: 'string', format: 'email' },
  },
} as const satisfies SchemaBase;
