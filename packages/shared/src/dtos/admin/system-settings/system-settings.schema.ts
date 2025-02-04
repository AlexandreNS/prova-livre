import type { SchemaBase } from '@prova-livre/shared/types/schema.type';

export const SystemSettingsSchema = {
  type: 'object',
  required: ['id', 'name', 'description', 'enabled'],
  properties: {
    id: { type: 'number' },
    name: { type: 'string' },
    description: { type: 'string' },
    enabled: { type: 'boolean' },
    value: { type: ['string', 'null'] },
  },
} as const satisfies SchemaBase;
