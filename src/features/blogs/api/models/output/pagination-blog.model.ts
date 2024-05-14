import { PaginationOutputModel } from '../../../../../infrastructure/models/output/pagination.output.model';
import { BlogOutputModel } from './blog.output.model';
import { QueryBlogInputModel } from '../input/query-blog.model';

export class PaginationBlogModel extends PaginationOutputModel {
  items: BlogOutputModel[];
}

export const PaginationBlogModelMapper = (
  query: QueryBlogInputModel,
  countBlogs: number,
  items: BlogOutputModel[],
): PaginationBlogModel => {
  const paginatorModel = new PaginationBlogModel();
  paginatorModel.pagesCount = Math.ceil(countBlogs / query.pageSize);
  paginatorModel.page = query.pageNumber;
  paginatorModel.pageSize = query.pageSize;
  paginatorModel.totalCount = countBlogs;
  paginatorModel.items = items;

  return paginatorModel;
};
