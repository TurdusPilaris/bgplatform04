import { Injectable } from '@nestjs/common';
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

  async findAll(queryDto: QueryBlogInputModel) {
    // : Promise<PaginationOutputModel<BlogOutputModel[]>>
    //params
    const limit = queryDto.pageSize;
    const offset = (queryDto.pageNumber - 1) * queryDto.pageSize;
    const searchNameTerm = queryDto.searchNameTerm
      ? `%${queryDto.searchNameTerm}%`
      : '%%';
    const sortDirection = (
      queryDto.sortDirection?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC'
    ) as 'ASC' | 'DESC'; // Приведение к литеральному типу

    const items = await this.blogsRepository
      .createQueryBuilder('blogs')
      .where('blogs.name ILIKE :name ', { name: searchNameTerm })
      .orderBy(`"${queryDto.sortBy}"`, sortDirection)
      .offset(offset)
      .limit(limit)
      .getMany();

    const countBlogs = await this.getCountBlogsByFilter(searchNameTerm);

    const res = items.map(this.blogOutputModelMapper);
    return this.paginationBlogModelMapper(queryDto, countBlogs, res);
  }

  async getCountBlogsByFilter(searchNameTerm: string) {
    return await this.blogsRepository
      .createQueryBuilder('blogs')
      .where('blogs.name ILIKE :name ', { name: searchNameTerm })
      .getCount();
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
