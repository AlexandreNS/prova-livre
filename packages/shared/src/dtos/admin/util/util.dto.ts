export const SearchSchemaProps = {
  search: { type: 'string' },
} as const;

export const PaginationSchemaRequired = ['page', 'limit', 'offset', 'pages', 'total', 'rows'] as const;

export const PaginationSchemaProps = {
  page: { type: 'number' },
  limit: { type: 'number' },
  offset: { type: 'number' },
  pages: { type: 'number' },
  total: { type: 'number' },
  order: { type: 'string' },
  sort: {
    type: 'string',
    enum: ['asc', 'desc'],
  },
} as const;
