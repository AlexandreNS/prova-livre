import type { SchemaBase } from '@prova-livre/shared/types/schema.type';

import { UserRole } from '@prova-livre/shared/constants/UserRole';

export const UserSchema = {
  type: 'object',
  required: ['id', 'name', 'email', 'role'],
  properties: {
    id: { type: 'number' },
    name: { type: 'string' },
    email: { type: 'string', format: 'email' },
    accessedAt: { type: ['string', 'null'] },
    role: { type: 'string', enum: Object.values(UserRole) },
  },
} as const satisfies SchemaBase;
