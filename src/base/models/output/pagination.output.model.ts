export class PaginationOutputModel<T> {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: T;
}

export const paginationModelMapper = <T>(
  query: { pageSize: number; pageNumber: number },
  totalCount: number,
  items: T[],
): PaginationOutputModel<T[]> => {
  return {
    pagesCount: Math.ceil(totalCount / query.pageSize),
    page: +query.pageNumber,
    pageSize: +query.pageSize,
    totalCount,
    items,
  };
};
