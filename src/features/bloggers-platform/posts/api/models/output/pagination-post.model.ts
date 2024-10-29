import { PostOutputModel } from './post.output.model';
import { QueryPostInputModel } from '../input/query-post.model';
import { PaginationOutputModel } from '../../../../../../base/models/output/pagination.output.model';

export const PaginationPostModelMapper = (
  query: QueryPostInputModel,
  countPosts: number,
  items: PostOutputModel[],
): PaginationOutputModel<PostOutputModel[]> => {
  return {
    pagesCount: Math.ceil(countPosts / query.pageSize),
    page: +query.pageNumber,
    pageSize: +query.pageSize,
    totalCount: countPosts,
    items: items,
  };
};
