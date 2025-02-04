import type { SchemaBase } from '@prova-livre/shared/types/schema.type';

export const CompanySchema = {
  type: 'object',
  required: ['id', 'name'],
  properties: {
    id: { type: 'number' },
    name: { type: 'string' },
  },
} as const satisfies SchemaBase;

export const CompanyWithRoleSchema = {
  type: 'object',
  required: ['id', 'name'],
  properties: {
    id: { type: 'number' },
    name: { type: 'string' },
    role: { type: 'string', enum: ['su', 'owner', 'admin', 'tutor', 'editor'] },
  },
} as const satisfies SchemaBase;
