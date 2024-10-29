import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogModelType } from '../domain/entiities/blog.entity';
import {
  BlogOutputModel,
  blogOutputModelMapper,
} from '../api/models/output/blog.output.model';
import { paginationBlogModelMapper } from '../api/models/output/pagination-blog.model';
import { QueryBlogInputModel } from '../api/models/input/query-blog.model';
import { PaginationOutputModel } from '../../../../base/models/output/pagination.output.model';

@Injectable()
export class BlogsQueryRepository {
  constructor(
    @InjectModel(Blog.name)
    private BlogModel: BlogModelType,
  ) {}
  async findById(blogId: string) {
    const blog = await this.BlogModel.findById(blogId, { __v: false });

    if (!blog) return null;
    return blogOutputModelMapper(blog);
  }

  async findAll(
    queryDto: QueryBlogInputModel,
  ): Promise<PaginationOutputModel<BlogOutputModel[]>> {
    const filterName = {
      name: {
        $regex: queryDto.searchNameTerm ?? '',
        $options: 'i',
      },
    };
    const items = await this.BlogModel.find(filterName, null, {
      sort: { [queryDto.sortBy]: queryDto.sortDirection },
    })
      .skip((queryDto.pageNumber - 1) * queryDto.pageSize)
      .limit(queryDto.pageSize)
      .exec();

    const itemsForPaginator = items.map(blogOutputModelMapper);
    const countBlogs = await this.BlogModel.countDocuments(filterName);

    return paginationBlogModelMapper(queryDto, countBlogs, itemsForPaginator);
  }
}
