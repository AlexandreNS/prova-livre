import type { SchemaFastify } from '@prova-livre/shared/types/schema.type';

export const UserCreateSchema = {
  tags: ['admin/user'],
  security: [],
  body: {
    type: 'object',
    required: ['name', 'email', 'password'],
    properties: {
      name: { type: 'string' },
      password: { type: 'string' },
      email: { type: 'string', format: 'email' },
    },
  },
  response: {
    200: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'number' },
      },
    },
  },
} as const satisfies SchemaFastify;
