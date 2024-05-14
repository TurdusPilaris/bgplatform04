import { QueryPaginationInputModel } from '../../../../../infrastructure/models/input/query-pagination.input.model';

export class QueryBlogInputModel extends QueryPaginationInputModel {
  searchNameTerm: { type: string };
}
