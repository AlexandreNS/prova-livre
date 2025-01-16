import type { SchemaBase } from '@prova-livre/shared/types/schema.type';

export const CompanySchema = {
  type: 'object',
  required: ['id', 'name'],
  properties: {
    id: { type: 'number' },
    name: { type: 'string' },
  },
} as const satisfies SchemaBase;
