import type { SchemaFastify } from '@prova-livre/shared/types/schema.type';

import { UserRole } from '@prova-livre/shared/constants/UserRole';
import { UserSchema } from '@prova-livre/shared/dtos/admin/user/user.schema';
import {
  PaginationSchemaProps,
  PaginationSchemaRequired,
  SearchSchemaProps,
} from '@prova-livre/shared/dtos/admin/util/util.dto';

export const UserListSchema = {
  tags: ['admin/user'],
  querystring: {
    type: 'object',
    properties: {
      ...SearchSchemaProps,
      ...PaginationSchemaProps,
      classId: { type: 'number' },
    },
  },
  response: {
    200: {
      type: 'object',
      required: PaginationSchemaRequired,
      properties: {
        ...PaginationSchemaProps,
        rows: {
          type: 'array',
          items: UserSchema,
        },
      },
    },
  },
} as const satisfies SchemaFastify;

export const UserGetSchema = {
  tags: ['admin/user'],
  params: {
    type: 'object',
    required: ['userId'],
    properties: {
      userId: { type: 'number' },
    },
  },
  response: {
    200: UserSchema,
  },
} as const satisfies SchemaFastify;

export const UserCreateSchema = {
  tags: ['admin/user'],
  body: {
    type: 'object',
    required: ['email', 'role'],
    properties: {
      name: { type: 'string' },
      email: { type: 'string', format: 'email' },
      role: { type: 'string', enum: Object.values(UserRole).filter((role) => role !== 'su') },
    },
  },
  response: {
    200: UserSchema,
  },
} as const satisfies SchemaFastify;

export const UserUpdateSchema = {
  tags: ['admin/user'],
  params: {
    type: 'object',
    required: ['userId'],
    properties: {
      userId: { type: 'number' },
    },
  },
  body: {
    type: 'object',
    required: ['email', 'role'],
    properties: {
      name: { type: 'string' },
      email: { type: 'string', format: 'email' },
      role: { type: 'string', enum: Object.values(UserRole).filter((role) => role !== 'su') },
    },
  },
  response: {
    200: UserSchema,
  },
} as const satisfies SchemaFastify;

export const UserDeleteSchema = {
  tags: ['admin/user'],
  params: {
    type: 'object',
    required: ['userId'],
    properties: {
      userId: { type: 'number' },
    },
  },
  response: {
    204: { type: 'null' },
  },
} as const satisfies SchemaFastify;
