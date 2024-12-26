import { Injectable } from '@nestjs/common';
import { QueryPostInputModel } from '../../api/models/input/query-post.model';
import {
  NewestLike,
  PostOutputModel,
} from '../../api/models/output/post.output.model';
import { PaginationOutputModel } from '../../../../../base/models/output/pagination.output.model';
import { DataSource } from 'typeorm';
import { PostSQL } from '../../api/models/sql/post.sql.model';

@Injectable()
export class PostsSqlQueryRepository {
  constructor(protected dataSource: DataSource) {}
  async findAll(
    queryDto: QueryPostInputModel,
    userId: string | null,
    blogId?: string,
  ) {
    const conditionForBlog = !blogId ? '' : ' WHERE b.id = $4';

    const query = `
        with countLikesAndDislike AS(
            SELECT count(*) as "count", "statusLike", "postId"
                FROM "likeForPosts"
                GROUP BY "statusLike", "postId"
        ),
        likeForCurrentUser AS(
            SELECT "statusLike", "postId"
            FROM "likeForPosts"
            WHERE "userId" = $3

        )
        SELECT 
        p.id, 
        p.title,
        p."shortDescription", 
        p.content,
        p."blogId",  
        b.name as "blogName",
        p."createdAt", 
        COALESCE(countDislike."count", 0) as "dislikesCount",
        COALESCE(countLike."count", 0) as "likesCount",
        COALESCE(likeForCurrentUser."statusLike", 'None') as "myStatus",
        (select array(select row_to_json(row) from (
        SELECT "likeForPosts".id, "likeForPosts"."postId", TO_CHAR("likeForPosts"."updatedAt", 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as "addedAt", "likeForPosts"."updatedAt", "likeForPosts"."userId", "user_tor"."userName" as login
        FROM public."likeForPosts"
        LEFT JOIN "user_tor" ON "likeForPosts"."userId" = "user_tor".id
        WHERE "statusLike" = 'Like' and "likeForPosts"."postId" =  p.id 
        ORDER BY "updatedAt" desc 
        limit 3
        
        ) as row
        
        ) )as "newestLikes"

            FROM public."posts" as p
            LEFT JOIN public."blogs" as b
            ON p."blogId" = b.id
            LEFT JOIN countLikesAndDislike as countDislike ON p.id = countDislike."postId" AND countDislike."statusLike" = 'Dislike'
            LEFT JOIN countLikesAndDislike as countLike  ON p.id = countLike."postId" AND countLike."statusLike" = 'Like'
            LEFT JOIN likeForCurrentUser ON  p.id = likeForCurrentUser."postId"
            ${conditionForBlog}
            ORDER BY "${queryDto.sortBy}" ${queryDto.sortDirection}
            LIMIT $1 OFFSET $2
 
    `;

    const parametersForPosts: (number | string)[] = [
      queryDto.pageSize,
      (queryDto.pageNumber - 1) * queryDto.pageSize,
      !userId ? '00000000-0000-0000-0000-000000000000' : userId,
    ];
    if (blogId) parametersForPosts.push(blogId);

    const res = await this.dataSource.query(query, parametersForPosts);

    const countPosts = await this.getCountPostByFilter(blogId);

    const itemsForPaginator = res.map((post) =>
      this.postOutputModelMapper(
        post,
        post.newestLikes.map((e) => {
          return new NewestLike(e.addedAt, e.userId, e.login);
        }),
      ),
    );

    return this.paginationPostModelMapper(
      queryDto,
      countPosts,
      itemsForPaginator,
    );
  }

  async getCountPostByFilter(blogId?: string) {
    const conditionForBlog = !blogId ? '' : ' WHERE b.id = $1';
    const query = `
    SELECT count(*) as "countOfPosts"
    FROM public."posts" as p
    LEFT JOIN public."blogs" as b
    ON p."blogId" = b.id
    ${conditionForBlog}
    `;

    let res;
    if (blogId) {
      res = await this.dataSource.query(query, [blogId]);
    } else {
      res = await this.dataSource.query(query);
    }

    return +res[0].countOfPosts;
  }
  async findById(postId: string, userId?: string) {
    const query = `
    with countLikesAndDislike AS(
            SELECT count(*) as "count", "statusLike", "postId"
                FROM "likeForPosts"
                WHERE "postId" = $1
                GROUP BY "statusLike", "postId"
        ),
        likeForCurrentUser AS(
            SELECT "statusLike", "postId"
            FROM "likeForPosts"
            WHERE "postId" = $1 AND "userId" = $2

        )
        SELECT 
        p.id, 
        p.title,
        p."shortDescription", 
        p.content,
        p."blogId",  
        b.name as "blogName",
        p."createdAt", 
        b.name as "blogName",
        COALESCE(countDislike."count", 0) as "dislikesCount",
        COALESCE(countLike."count", 0) as "likesCount",
        COALESCE(likeForCurrentUser."statusLike", 'None') as "myStatus"

            FROM public."posts" as p
            LEFT JOIN public."blogs" as b
            ON p."blogId" = b.id
            LEFT JOIN countLikesAndDislike as countDislike ON p.id = countDislike."postId" AND countDislike."statusLike" = 'Dislike'
            LEFT JOIN countLikesAndDislike as countLike  ON p.id = countLike."postId" AND countLike."statusLike" = 'Like'
            LEFT JOIN likeForCurrentUser ON  p.id = likeForCurrentUser."postId"
            WHERE p.id = $1
    `;
    const foundPosts: PostSQL[] = await this.dataSource.query(query, [
      postId,
      !userId ? '00000000-0000-0000-0000-000000000000' : userId,
    ]);

    if (foundPosts.length === 0) return null;

    const queryForNewestLikes = `
    SELECT "likeForPosts".id, TO_CHAR("likeForPosts"."updatedAt", 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as "addedAt", "likeForPosts"."updatedAt", "likeForPosts"."userId", "user_tor"."userName" as login
        FROM public."likeForPosts"
        LEFT JOIN "user_tor" ON "likeForPosts"."userId" = "user_tor".id
        WHERE "postId" = $1 AND "statusLike" = 'Like'
        ORDER BY "updatedAt" desc
        LIMIT 3;
    `;

    const resNewestLikes = await this.dataSource.query(queryForNewestLikes, [
      postId,
    ]);

    const newestLikes: NewestLike[] = resNewestLikes.map((e) => {
      return new NewestLike(e.addedAt, e.userId, e.login);
    });

    return this.postOutputModelMapper(foundPosts[0], newestLikes);
  }

  postOutputModelMapper = (
    post: PostSQL,
    newestLikes: NewestLike[],
  ): PostOutputModel => {
    return new PostOutputModel(
      post.id,
      post.title,
      post.shortDescription,
      post.content,
      post.blogId,
      post.blogName,
      post.createdAt,
      post.dislikesCount,
      post.likesCount,
      post.myStatus,
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
