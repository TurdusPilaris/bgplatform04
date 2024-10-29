import { UserOutputModel } from './user.output.model';
import { QueryUserInputModel } from '../input/query-user.input.model';
import { PaginationOutputModel } from '../../../../../../base/models/output/pagination.output.model';

export const paginationUserOutputModelMapper = (
  query: QueryUserInputModel,
  countUsers: number,
  items: UserOutputModel[],
): PaginationOutputModel<UserOutputModel[]> => {
  return {
    pagesCount: Math.ceil(countUsers / query.pageSize),
    page: +query.pageNumber,
    pageSize: +query.pageSize,
    totalCount: countUsers,
    items: items,
  };
};
