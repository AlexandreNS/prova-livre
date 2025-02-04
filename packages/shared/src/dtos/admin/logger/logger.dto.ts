import type { SchemaFastify } from '@prova-livre/shared/types/schema.type';

export const LoggerListSchema = {
  tags: ['admin/logger'],
  response: {
    200: {
      type: 'array',
      items: {
        type: 'object',
        required: ['type', 'timestamp'],
        properties: {
          type: { type: 'string', enum: ['error', 'log', 'warn'] },
          timestamp: { type: 'number' },
          summary: { type: ['string', 'null'] },
          context: {
            type: 'object',
            properties: {
              message: { type: ['string', 'null'] },
            },
          },
        },
      },
    },
  },
} as const satisfies SchemaFastify;
