import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Blog,
  BlogDocument,
  BlogModelType,
} from '../domain/entiities/blog.entity';
import { BlogOutputModel } from '../api/models/output/blog.output.model';
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
    return this.blogOutputModelMapper(blog);
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

    const itemsForPaginator: BlogOutputModel[] = items.map(
      this.blogOutputModelMapper,
    );
    const countBlogs = await this.BlogModel.countDocuments(filterName);

    return this.paginationBlogModelMapper(
      queryDto,
      countBlogs,
      itemsForPaginator,
    );
  }

  paginationBlogModelMapper = (
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

  blogOutputModelMapper = (blog: BlogDocument): BlogOutputModel => {
    return {
      id: blog.id,
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt.toISOString(),
      isMembership: blog.isMembership,
    };
  };
}
