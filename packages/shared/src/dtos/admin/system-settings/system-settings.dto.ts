import type { SchemaFastify } from '@prova-livre/shared/types/schema.type';

import { SystemSettingsSchema } from '@prova-livre/shared/dtos/admin/system-settings/system-settings.schema';

export const SystemSettingsListSchema = {
  tags: ['admin/system-settings'],
  response: {
    200: {
      type: 'array',
      items: SystemSettingsSchema,
    },
  },
} as const satisfies SchemaFastify;

export const SystemSettingsUpdateSchema = {
  tags: ['admin/system-settings'],
  params: {
    type: 'object',
    required: ['systemSettingsId'],
    properties: {
      systemSettingsId: { type: 'number' },
    },
  },
  body: {
    type: 'object',
    required: ['enabled'],
    properties: {
      enabled: { type: 'boolean' },
      value: { type: ['string', 'null'] },
    },
  },
  response: {
    204: { type: 'null' },
  },
} as const satisfies SchemaFastify;

export const SystemSettingsHasCreateCompanyPermissionSchema = {
  tags: ['admin/system-settings'],
  response: {
    200: {
      type: 'object',
      required: ['allowed'],
      properties: {
        allowed: { type: 'boolean' },
      },
    },
  },
} as const satisfies SchemaFastify;
