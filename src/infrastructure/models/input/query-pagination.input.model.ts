export class QueryPaginationInputModel {
  sortBy: string = 'createdAt';
  sortDirection: string = 'desc';
  pageNumber: number = 1;
  pageSize: number = 10;
}
