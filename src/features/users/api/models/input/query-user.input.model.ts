import { QueryPaginationInputModel } from '../../../../../base/models/input/query-pagination.input.model';

export class QueryUserInputModel extends QueryPaginationInputModel {
  searchLoginTerm: { type: string };
  searchEmailTerm: { type: string };
}
