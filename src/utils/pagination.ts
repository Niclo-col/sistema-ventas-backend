export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export function toSkipTake({ page, pageSize }: PaginationParams) {
  return { skip: (page - 1) * pageSize, take: pageSize };
}

export function buildPaginatedResult<T>(
  data: T[],
  total: number,
  { page, pageSize }: PaginationParams
): PaginatedResult<T> {
  return {
    data,
    meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) || 1 },
  };
}
