import { PaginationOutputModel } from '../../../../../base/models/output/pagination.output.model';
import { CommentOutputModel } from './comment.output.model';
import { QueryCommentModel } from '../input/query-comment.model';
import { CommentModelType } from '../../../domain/entities/comment.entity';

export class PaginationCommentModel extends PaginationOutputModel {
  items: CommentOutputModel[];
}

export const PaginationCommentModelMapper = (
  query: QueryCommentModel,
  countComments: number,
  items: CommentOutputModel[],
): PaginationCommentModel => {
  const paginatorModel = new PaginationCommentModel();
  paginatorModel.pagesCount = Math.ceil(countComments / query.pageSize);
  paginatorModel.page = +query.pageNumber;
  paginatorModel.pageSize = +query.pageSize;
  paginatorModel.totalCount = countComments;
  paginatorModel.items = items;

  return paginatorModel;
};
