import { CommentOutputModel } from './comment.output.model';
import { QueryCommentModel } from '../input/query-comment.model';
import { PaginationOutputModel } from '../../../../../../base/models/output/pagination.output.model';

export const paginationCommentModelMapper = (
  query: QueryCommentModel,
  countComments: number,
  items: CommentOutputModel[],
): PaginationOutputModel<CommentOutputModel[]> => {
  return {
    pagesCount: Math.ceil(countComments / query.pageSize),
    page: +query.pageNumber,
    pageSize: +query.pageSize,
    totalCount: countComments,
    items: items,
  };
};
