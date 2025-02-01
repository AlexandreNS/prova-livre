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

export const AuthRequestPasswordRecoverySchema = {
  tags: ['admin/auth'],
  security: [],
  body: {
    type: 'object',
    required: ['email'],
    properties: {
      email: { type: 'string', format: 'email' },
    },
  },
  response: {
    204: { type: 'null' },
  },
} as const satisfies SchemaFastify;

export const AuthResetPasswordSchema = {
  tags: ['admin/auth'],
  security: [],
  body: {
    type: 'object',
    required: ['securityCode', 'password', 'passwordConfirm'],
    properties: {
      securityCode: { type: 'string' },
      password: { type: 'string' },
      passwordConfirm: { type: 'string' },
    },
  },
  response: {
    204: { type: 'null' },
  },
} as const satisfies SchemaFastify;

export const AuthVerifyTokenResetPasswordSchema = {
  tags: ['admin/auth'],
  security: [],
  body: {
    type: 'object',
    required: ['securityCode'],
    properties: {
      securityCode: { type: 'string' },
    },
  },
  response: {
    200: {
      type: 'object',
      required: ['id', 'email'],
      properties: {
        id: { type: 'number' },
        name: { type: ['string', 'null'] },
        email: { type: 'string', format: 'email' },
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
