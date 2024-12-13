import { Injectable } from '@nestjs/common';
import { QueryPostInputModel } from '../../api/models/input/query-post.model';
import {
  NewestLike,
  PostOutputModel,
} from '../../api/models/output/post.output.model';
import { PaginationOutputModel } from '../../../../../base/models/output/pagination.output.model';
import { DataSource, Repository } from 'typeorm';

import { InjectRepository } from '@nestjs/typeorm';
import { PostSQL } from '../../domain/entiities/post.sql.entity';
import { likeStatus } from '../../../../../base/models/likesStatus';

@Injectable()
export class PostsTorQueryRepository {
  constructor(
    protected dataSource: DataSource,
    @InjectRepository(PostSQL)
    private readonly postsRepository: Repository<PostSQL>,
  ) {}
  async findAll(
    queryDto: QueryPostInputModel,
    userId: string | null,
    blogId?: string,
  ) {
    //params
    const limit = queryDto.pageSize;
    const offset = (queryDto.pageNumber - 1) * queryDto.pageSize;

    const sortDirection = (
      queryDto.sortDirection?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC'
    ) as 'ASC' | 'DESC'; // Приведение к литеральному типу

    const sortBy =
      queryDto.sortBy === 'blogName'
        ? `"blogs_name"`
        : `posts."${queryDto.sortBy}"`;

    const queryBuilder = this.postsRepository
      .createQueryBuilder('posts')
      .innerJoin('posts.blog', 'blogs')
      .addSelect(['blogs.id', 'blogs.name']);

    if (blogId) {
      queryBuilder.andWhere('blogs.id = :blogId', { blogId });
    }

    const items = await queryBuilder
      .orderBy(sortBy, sortDirection)
      .offset(offset)
      .limit(limit)
      .getMany();

    const countPosts = await this.getCountPostByFilter(blogId);

    console.log('items', items);
    const itemsForPaginator = items.map((post) =>
      this.postOutputModelMapper(post, []),
    );

    // const itemsForPaginator = res.map((post) =>
    //   this.postOutputModelMapper(
    //     post,
    //     post.newestLikes.map((e) => {
    //       return new NewestLike(e.addedAt, e.userId, e.login);
    //     }),
    //   ),
    // );
    //
    return this.paginationPostModelMapper(
      queryDto,
      countPosts,
      itemsForPaginator,
    );
  }

  async getCountPostByFilter(blogId?: string) {
    if (!blogId) {
      return await this.postsRepository.count();
    }

    return await this.postsRepository.count({
      where: {
        blog: { id: blogId }, // Например, подсчитать записи, связанные с определённым blogId
      },
    });
  }
  async findById(id: string, userId?: string) {
    const items = await this.postsRepository.findOne({
      where: { id: id },
      relations: ['blog'],
    });

    if (!items) return null;

    return this.postOutputModelMapper(items, []);
  }

  postOutputModelMapper = (
    post: any,
    newestLikes: NewestLike[],
  ): PostOutputModel => {
    return new PostOutputModel(
      post.id,
      post.title,
      post.shortDescription,
      post.content,
      post.blog.id,
      post.blog.name,
      post.createdAt,
      0,
      0,
      likeStatus.None,
      //   post.dislikesCount,
      //   post.likesCount,
      //   post.myStatus,
      newestLikes,
    );
  };

  paginationPostModelMapper = (
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
}
