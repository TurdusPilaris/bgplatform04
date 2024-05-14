import { QueryPaginationInputModel } from '../../../../../infrastructure/models/input/query-pagination.input.model';

export class QueryUserInputModel extends QueryPaginationInputModel {
  searchLoginTerm: { type: string };
  searchEmailTerm: { type: string };
}
