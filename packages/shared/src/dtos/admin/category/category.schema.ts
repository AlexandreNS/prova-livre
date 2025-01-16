import type { SchemaBase } from '@prova-livre/shared/types/schema.type';

export const CategorySchema = {
  type: 'object',
  required: ['id', 'name', 'parentId', 'parent'],
  properties: {
    id: { type: 'number' },
    name: { type: 'string' },
    allowMultipleSelection: { type: 'boolean' },
    parentId: { type: ['number', 'null'] },
    parent: {
      type: ['object', 'null'],
      required: ['id', 'name'],
      properties: {
        id: { type: 'number' },
        name: { type: 'string' },
      },
    },
  },
} as const satisfies SchemaBase;
