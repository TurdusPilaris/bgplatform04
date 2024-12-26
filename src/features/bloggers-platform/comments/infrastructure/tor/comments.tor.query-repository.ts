import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { CommentOutputModel } from '../../api/model/output/comment.output.model';
import { CommentSQL } from '../../api/model/sql/comment.model.sql';
import { QueryCommentModel } from '../../api/model/input/query-comment.model';
import { QueryPostInputModel } from '../../../posts/api/models/input/query-post.model';
import { PaginationOutputModel } from '../../../../../base/models/output/pagination.output.model';
import { InjectRepository } from '@nestjs/typeorm';
import { groupBy } from 'rxjs';

@Injectable()
export class CommentsTorQueryRepository {
  constructor(
    protected dataSource: DataSource,
    @InjectRepository(CommentSQL)
    private readonly commentsRepository: Repository<CommentSQL>,
  ) {}

  async findAll(
    queryDto: QueryCommentModel,
    postId: string,
    userId: string | null,
  ) {
    //распарсим параметры для удобства
    const limit = queryDto.pageSize;
    const offset = (queryDto.pageNumber - 1) * queryDto.pageSize;

    const sortDirection = (
      queryDto.sortDirection?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC'
    ) as 'ASC' | 'DESC'; // Приведение к литеральному типу

    const sortBy = `"${queryDto.sortBy}"`;
    //временная таблица для получения моего статуса
    const subQueryMyStatus = await this.dataSource
      .createQueryBuilder()
      .select('like.statusLike', 'myStatus')
      .addSelect('like.commentId', 'commentId')
      .from('likeForComments', 'like')
      .where('like.userId = :userId', { userId })
      .groupBy('like.statusLike')
      .addGroupBy('like.commentId');

    //временная таблица для получения количества лайков и дизлайков
    const subQueryLikes = await this.dataSource
      .createQueryBuilder()
      // .subQuery()
      .select('like.statusLike', 'statusLike')
      .addSelect('like.commentId', 'commentId')
      .addSelect('COUNT(*)', 'count')
      .from('likeForComments', 'like')
      .groupBy('like.statusLike')
      .addGroupBy('like.commentId');

    const builder = this.commentsRepository
      .createQueryBuilder('c')
      .select([
        'c.*',
        `COALESCE("myLikes"."myStatus", 'None') AS "myStatus"`,
        'CAST(COALESCE("countStatusLikes".count, 0) AS INTEGER) AS "likesCount"',
        'CAST(COALESCE("countStatusDislikes".count, 0) AS INTEGER) AS "dislikesCount"',
        'u."userName" AS "commentatorName"',
      ])
      .addCommonTableExpression(subQueryMyStatus, 'myLikes')
      .addCommonTableExpression(subQueryLikes, 'countStatusLikes')
      .addCommonTableExpression(subQueryLikes, 'countStatusDislikes')
      .leftJoin('myLikes', 'myLikes', '"myLikes"."commentId" = c.id')
      .leftJoin(
        'countStatusLikes',
        'countStatusLikes',
        '"countStatusLikes"."commentId" = c.id AND "countStatusLikes"."statusLike" = :like',
        { like: 'Like' },
      )
      .leftJoin(
        'countStatusDislikes',
        'countStatusDislikes',
        '"countStatusDislikes"."commentId" = c.id AND "countStatusDislikes"."statusLike" = :dislike',
        { dislike: 'Dislike' },
      )
      .leftJoin('user_tor', 'u', 'c.userId = u.id')
      .where('c.postId =:postId', { postId })
      .orderBy(sortBy, sortDirection)
      .limit(limit)
      .offset(offset);
    const countComments = await builder.getCount();
    const items = await builder.getRawMany();

    console.log('items', items);

    const itemsForPaginator = items.map((comment) =>
      this.commentOutputModelMapper(comment),
    );
    return this.paginationCommentModelMapper(
      queryDto,
      countComments,
      itemsForPaginator,
    );
  }

  paginationCommentModelMapper = (
    query: QueryPostInputModel,
    countPosts: number,
    items: CommentOutputModel[],
  ): PaginationOutputModel<CommentOutputModel[]> => {
    return {
      pagesCount: Math.ceil(countPosts / query.pageSize),
      page: +query.pageNumber,
      pageSize: +query.pageSize,
      totalCount: countPosts,
      items: items,
    };
  };
  async findCommentById(
    id: string,
    userId: string | null,
  ): Promise<CommentOutputModel | null> {
    if (!userId) userId = '00000000-0000-0000-0000-000000000000';

    //временная таблица для получения моего статуса
    const subQueryMyStatus = await this.dataSource
      .createQueryBuilder()
      .select('like.statusLike', 'myStatus')
      .addSelect('like.commentId', 'commentId')
      .from('likeForComments', 'like')
      .where('like.commentId = :id AND like.userId = :userId', { id, userId })
      .groupBy('like.statusLike')
      .addGroupBy('like.commentId');

    //временная таблица для получения количества лайков и дизлайков
    const subQueryLikes = await this.dataSource
      .createQueryBuilder()
      // .subQuery()
      .select('like.statusLike', 'statusLike')
      .addSelect('like.commentId', 'commentId')
      .addSelect('COUNT(*)', 'count')
      .from('likeForComments', 'like')
      .where('like.commentId = :id', { id })
      .groupBy('like.statusLike')
      .addGroupBy('like.commentId');

    const items = await this.commentsRepository
      .createQueryBuilder('c')
      .select([
        'c.*',
        `COALESCE("myLikes"."myStatus", 'None') AS "myStatus"`,
        'CAST(COALESCE("countStatusLikes".count, 0) AS INTEGER) AS "likesCount"',
        'CAST(COALESCE("countStatusDislikes".count, 0) AS INTEGER) AS "dislikesCount"',
        'u."userName" AS "commentatorName"',
      ])
      .addCommonTableExpression(subQueryMyStatus, 'myLikes')
      .addCommonTableExpression(subQueryLikes, 'countStatusLikes')
      .addCommonTableExpression(subQueryLikes, 'countStatusDislikes')
      .leftJoin('myLikes', 'myLikes', '"myLikes"."commentId" = c.id')
      .leftJoin(
        'countStatusLikes',
        'countStatusLikes',
        '"countStatusLikes"."commentId" = c.id AND "countStatusLikes"."statusLike" = :like',
        { like: 'Like' },
      )
      .leftJoin(
        'countStatusDislikes',
        'countStatusDislikes',
        '"countStatusDislikes"."commentId" = c.id AND "countStatusDislikes"."statusLike" = :dislike',
        { dislike: 'Dislike' },
      )
      .leftJoin('user_tor', 'u', 'c.userId = u.id')
      .where('c.id =:id', { id })
      .getRawOne();

    if (!items) return null;

    return this.commentOutputModelMapper(items);
  }

  commentOutputModelMapper = (comment: any): CommentOutputModel => {
    return new CommentOutputModel(
      comment.id,
      comment.userId,
      comment.commentatorName,
      comment.content,
      comment.createdAt,
      comment.likesCount,
      comment.dislikesCount,
      comment.myStatus,
    );
  };
}
