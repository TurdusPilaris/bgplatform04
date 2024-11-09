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
import { DataSource } from 'typeorm';

@Injectable()
export class BlogsSqlQueryRepository {
  constructor(
    @InjectModel(Blog.name)
    private BlogModel: BlogModelType,
    protected dataSource: DataSource,
  ) {}
  async findById(blogId: string) {
    const query = `
    SELECT name, description, "websiteUrl"
        FROM public."Blogs"
        WHERE id = $1;
    `;

    const res = await this.dataSource.query(query, [blogId]);

    if (res.length === 0) return null;

    return res.map((e) => {
      return {
        ...e,
      };
    })[0];
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
