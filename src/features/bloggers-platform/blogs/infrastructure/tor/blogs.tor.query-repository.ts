import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Blog,
  BlogDocument,
  BlogModelType,
} from '../../domain/entiities/blog.entity';
import { BlogOutputModel } from '../../api/models/output/blog.output.model';
import { QueryBlogInputModel } from '../../api/models/input/query-blog.model';
import { PaginationOutputModel } from '../../../../../base/models/output/pagination.output.model';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { BlogSQL } from '../../domain/entiities/blog.sql.entity';

@Injectable()
export class BlogsTorQueryRepository {
  constructor(
    protected dataSource: DataSource,
    @InjectRepository(BlogSQL)
    private readonly blogsRepository: Repository<BlogSQL>,
  ) {}
  async findById(blogId: string): Promise<BlogOutputModel | null> {
    const foundBlog = await this.blogsRepository.findOneBy({ id: blogId });
    if (!foundBlog) return null;
    return this.blogOutputModelMapper(foundBlog);
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

  blogOutputModelMapper = (blog: BlogSQL): BlogOutputModel => {
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
