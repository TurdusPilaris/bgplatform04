import { QueryPaginationInputModel } from '../../../../../base/models/input/query-pagination.input.model';

export class QueryBlogInputModel extends QueryPaginationInputModel {
  searchNameTerm: { type: string };
}
