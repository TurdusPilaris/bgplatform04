import { BlogOutputModel } from './blog.output.model';
import { QueryBlogInputModel } from '../input/query-blog.model';
import { PaginationOutputModel } from '../../../../../../base/models/output/pagination.output.model';

export const paginationBlogModelMapper = (
  query: QueryBlogInputModel,
  countBlogs: number,
  items: BlogOutputModel[],
): PaginationOutputModel<BlogOutputModel[]> => {
  return {
    pagesCount: Math.ceil(countBlogs / query.pageSize),
    page: +query.pageNumber,
    pageSize: +query.pageSize,
    totalCount: countBlogs,
    items: items,
  };
};
