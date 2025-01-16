import type { SchemaFastify } from '@prova-livre/shared/types/schema.type';

export const AuthLoginSchema = {
  tags: ['admin/auth'],
  security: [],
  body: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: { type: 'string', format: 'email' },
      password: { type: 'string' },
    },
  },
  response: {
    200: {
      type: 'object',
      required: ['token'],
      properties: {
        token: { type: 'string' },
      },
    },
  },
} as const satisfies SchemaFastify;

export const AuthMeSchema = {
  tags: ['admin/auth'],
  response: {
    200: {
      type: 'object',
      required: ['id', 'name', 'email', 'role'],
      properties: {
        id: { type: 'number' },
        name: { type: 'string' },
        email: { type: 'string', format: 'email' },
        role: {
          type: 'string',
          enum: ['su', 'owner', 'admin', 'tutor'],
        },
        company: {
          type: 'object',
          required: ['id', 'name'],
          properties: {
            id: { type: 'number' },
            name: { type: 'string' },
          },
        },
      },
    },
  },
} as const satisfies SchemaFastify;

export const AuthCompanySignSchema = {
  tags: ['admin/auth'],
  body: {
    type: 'object',
    required: ['companyId'],
    properties: {
      companyId: { type: 'number' },
    },
  },
  response: {
    200: {
      type: 'object',
      required: ['token'],
      properties: {
        token: { type: 'string' },
      },
    },
  },
} as const satisfies SchemaFastify;
