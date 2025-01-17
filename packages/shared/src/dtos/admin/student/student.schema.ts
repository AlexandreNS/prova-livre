import type { SchemaBase } from '@prova-livre/shared/types/schema.type';

export const StudentSchema = {
  type: 'object',
  required: ['id', 'email'],
  properties: {
    id: { type: 'number' },
    name: { type: 'string' },
    email: { type: 'string', format: 'email' },
    accessedAt: { type: ['string', 'null'] },
  },
} as const satisfies SchemaBase;
