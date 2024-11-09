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
    const query = `
    SELECT id, name, description, "websiteUrl", "createdAt", "isMembership"
        FROM public."Blogs" 
        WHERE "name" ILIKE $3 
        ORDER BY "${queryDto.sortBy}" ${queryDto.sortDirection}
        LIMIT $1 OFFSET $2
    `;

    const res = await this.dataSource.query(query, [
      queryDto.pageSize,
      (queryDto.pageNumber - 1) * queryDto.pageSize,
      `%${queryDto.searchNameTerm}%`,
    ]);

    console.log('res', res);
    console.log('query', query);
    console.log(
      '`%${queryDto.searchNameTerm}%`',
      `%${queryDto.searchNameTerm}%`,
    );
    const countBlogs = await this.getCountBlogsByFilter(
      queryDto.searchNameTerm,
    );

    return this.paginationBlogModelMapper(queryDto, countBlogs, res);

    // const filterName = {
    //   name: {
    //     $regex: queryDto.searchNameTerm ?? '',
    //     $options: 'i',
    //   },
    // };
    // const items = await this.BlogModel.find(filterName, null, {
    //   sort: { [queryDto.sortBy]: queryDto.sortDirection },
    // })
    //   .skip((queryDto.pageNumber - 1) * queryDto.pageSize)
    //   .limit(queryDto.pageSize)
    //   .exec();
    //
    // const itemsForPaginator: BlogOutputModel[] = items.map(
    //   this.blogOutputModelMapper,
    // );
    // const countBlogs = await this.BlogModel.countDocuments(filterName);
    //
    // return this.paginationBlogModelMapper(
    //   queryDto,
    //   countBlogs,
    //   itemsForPaginator,
    // );
  }

  async getCountBlogsByFilter(searchNameTerm: string) {
    const query = `
    SELECT  count(*) as "countOfBlogs"
	      FROM public."Blogs" u
	      WHERE "name" ILIKE $1
    `;

    const res = await this.dataSource.query(query, [`%${searchNameTerm}%`]);

    return +res[0].countOfBlogs;
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
