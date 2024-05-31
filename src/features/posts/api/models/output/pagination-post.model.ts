import { PaginationOutputModel } from '../../../../../base/models/output/pagination.output.model';
import { PostOutputModel } from './post.output.model';
import { QueryPostInputModel } from '../input/query-post.model';

export class PaginationPostModel extends PaginationOutputModel {
  items: PostOutputModel[];
}

export const PaginationPostModelMapper = (
  query: QueryPostInputModel,
  countPosts: number,
  items: PostOutputModel[],
): PaginationPostModel => {
  const paginatorModel = new PaginationPostModel();
  paginatorModel.pagesCount = Math.ceil(countPosts / query.pageSize);
  paginatorModel.page = +query.pageNumber;
  paginatorModel.pageSize = +query.pageSize;
  paginatorModel.totalCount = countPosts;
  paginatorModel.items = items;

  return paginatorModel;
};
