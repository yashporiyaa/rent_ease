import type { PaginationQueryDto } from '../dto/pagination-query.dto.js';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

export type PaginationParams = {
  page: number;
  pageSize: number;
  skip: number;
  take: number;
};

export type PaginationMeta = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

export function resolvePagination(
  query: PaginationQueryDto,
): PaginationParams {
  const page =
    typeof query.page === 'number' && Number.isFinite(query.page)
      ? Math.max(query.page, 1)
      : DEFAULT_PAGE;

  const requestedPageSize =
    typeof query.pageSize === 'number' && Number.isFinite(query.pageSize)
      ? query.pageSize
      : DEFAULT_PAGE_SIZE;

  const pageSize = Math.min(Math.max(requestedPageSize, 1), MAX_PAGE_SIZE);

  return {
    page,
    pageSize,
    skip: (page - 1) * pageSize,
    take: pageSize,
  };
}

export function buildPaginationMeta(
  params: Pick<PaginationParams, 'page' | 'pageSize'>,
  totalItems: number,
): PaginationMeta {
  return {
    page: params.page,
    pageSize: params.pageSize,
    totalItems,
    totalPages: Math.max(1, Math.ceil(totalItems / params.pageSize)),
  };
}
