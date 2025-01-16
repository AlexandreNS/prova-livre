export type PaginationConfig = {
  limit?: '*' | number;
  offset?: number;
  order?: string;
  page?: number;
  sort?: 'ASC' | 'DESC' | 'asc' | 'desc' | -1 | 1;
};

/**
 * A paginação só será aplicada se informado o parâmetro "page"
 */
export default async function paginate<ModelType, FindManyType>(
  model: any,
  config?: PaginationConfig,
  options?: FindManyType,
) {
  let { page, limit, offset, sort } = config || {};
  const { order } = config || {};

  let pages = 1;
  let orderBy;

  // Não permitir mais de 200 registros
  const maxRows = 200;

  const total = await model.count({
    ...options,
    include: undefined,
  });

  options = options || ({} as FindManyType);
  page = Number(page || 1);

  if (limit === '*') {
    limit = maxRows;
    offset = offset ? Number(offset) : undefined;
  } else {
    limit = Math.min(Number(limit || 10), maxRows);
    offset = Number(offset || (page - 1) * limit);
    pages = Math.ceil(total / limit);
  }

  if (order) {
    sort = [-1, 'DESC', 'desc'].includes(sort as any) ? 'desc' : 'asc';
    orderBy = { [order]: sort };
  }

  const rows: ModelType[] = await model.findMany({
    ...options,
    take: limit,
    skip: offset,
    orderBy,
  });

  return { page, limit, offset, pages, total, order, sort, rows };
}
