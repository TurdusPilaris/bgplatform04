import { PaginationOutputModel } from '../../../../../base/models/output/pagination.output.model';
import { UserOutputModel } from './user.output.model';
import { UserDocument } from '../../../domain/entities/user.entity';
import { QueryUserInputModel } from '../input/query-user.input.model';

export class PaginationUserModel extends PaginationOutputModel {
  items: UserOutputModel[];
}

export const PaginationUserOutputModelMapper = (
  query: QueryUserInputModel,
  countUsers: number,
  items: UserOutputModel[],
): PaginationUserModel => {
  const paginatorModel = new PaginationUserModel();

  paginatorModel.pagesCount = Math.ceil(countUsers / query.pageSize);
  paginatorModel.page = +query.pageNumber;
  paginatorModel.pageSize = +query.pageSize;
  paginatorModel.totalCount = countUsers;
  paginatorModel.items = items;

  return paginatorModel;
};
