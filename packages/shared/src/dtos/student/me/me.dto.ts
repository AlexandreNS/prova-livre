import type { SchemaFastify } from '@prova-livre/shared/types/schema.type';

import { MeSchema } from '@prova-livre/shared/dtos/student/me/me.schema';

export const MeGetSchema = {
  tags: ['student/me'],
  response: {
    200: MeSchema,
  },
} as const satisfies SchemaFastify;

export const MeUpdateSchema = {
  tags: ['student/me'],
  body: {
    type: 'object',
    properties: {
      name: { type: 'string' },
    },
  },
  response: {
    200: MeSchema,
  },
} as const satisfies SchemaFastify;

export const MePasswordUpdateSchema = {
  tags: ['student/me'],
  body: {
    type: 'object',
    required: ['currentPassword', 'password', 'passwordConfirm'],
    properties: {
      currentPassword: { type: 'string' },
      password: { type: 'string' },
      passwordConfirm: { type: 'string' },
    },
  },
  response: {
    204: { type: 'null' },
  },
} as const satisfies SchemaFastify;
