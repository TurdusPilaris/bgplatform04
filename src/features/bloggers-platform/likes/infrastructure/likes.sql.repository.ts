import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { likeStatus } from '../../../../base/models/likesStatus';
import { LikeForPostSQL } from '../api/model/sql/likeForPost.model.sql';
import { LikeForCommentSQL } from '../api/model/sql/likeForComment.model.sql';

@Injectable()
export class LikesSqlRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async createLikeForPost(
    postId: string,
    userId: string,
    newStatusLike: likeStatus,
  ) {
    const query = `
      INSERT INTO public."LikeForPost"(
     "postId", "userId", "statusLike", "createdAt", "updatedAt")
        VALUES ( $1, $2, $3, $4, $5) RETURNING id;
    `;

    const res = await this.dataSource.query(query, [
      postId,
      userId,
      newStatusLike,
      new Date(),
      new Date(),
    ]);

    return res[0].id;
  }

  async createLikeForComment(
    commentId: string,
    userId: string,
    newStatusLike: likeStatus,
  ) {
    const query = `
      INSERT INTO public."LikeForComment"(
     "commentId", "userId", "statusLike", "createdAt", "updatedAt")
        VALUES ( $1, $2, $3, $4, $5) RETURNING id;
    `;

    const res = await this.dataSource.query(query, [
      commentId,
      userId,
      newStatusLike,
      new Date(),
      new Date(),
    ]);

    return res[0].id;
  }
  async findLikeByUserAndPost(
    postID: string,
    userId: string,
  ): Promise<LikeForPostSQL | null> {
    const query = `
    SELECT likes.id, likes."postId", likes."userId", likes."statusLike", likes."createdAt", likes."updatedAt", users."userName" as login
        FROM public."LikeForPost" as likes
        LEFT JOIN "Users" as users ON users.id = likes."userId"
        WHERE "postId" = $1 AND "userId" = $2;
    `;

    const res = await this.dataSource.query(query, [postID, userId]);

    if (res.length === 0) return null;

    const likes: LikeForPostSQL[] = res.map((e) => {
      return new LikeForPostSQL(
        e.id,
        e.postId,
        e.userId,
        e.login,
        e.statusLike,
        e.createdAt,
        e.updatedAt,
      );
    });

    return likes[0];
  }

  async findLikeByUserAndComment(
    commentId: string,
    userId: string,
  ): Promise<LikeForCommentSQL | null> {
    const query = `
    SELECT likes.id, likes."commentId", likes."userId", likes."statusLike", likes."createdAt", likes."updatedAt", users."userName" as login
        FROM public."LikeForComment" as likes
        LEFT JOIN "Users" as users ON users.id = likes."userId"
        WHERE "commentId" = $1 AND "userId" = $2;
    `;

    const res = await this.dataSource.query(query, [commentId, userId]);

    if (res.length === 0) return null;

    const likes: LikeForCommentSQL[] = res.map((e) => {
      return new LikeForCommentSQL(
        e.id,
        e.commentId,
        e.userId,
        e.login,
        e.statusLike,
        e.createdAt,
        e.updatedAt,
      );
    });

    return likes[0];
  }
  async findThreeLastLikesByPost(
    postId: string,
  ): Promise<LikeForPostSQL[] | null> {
    const query = `
    SELECT likes.id, likes."postId", likes."userId", likes."statusLike", likes."createdAt", likes."updatedAt", users."userName" as login
        FROM public."LikeForPost" as likes
        LEFT JOIN "Users" as users ON users.id = likes."userId"
        WHERE "postId" = $1 AND "statusLike" = 'Like'
        LIMIT 3;
    `;

    const res = await this.dataSource.query(query, [postId]);

    if (res.length === 0) return null;

    return res.map((e) => {
      return new LikeForPostSQL(
        e.id,
        e.postId,
        e.userId,
        e.login,
        e.statusLike,
        e.createdAt,
        e.updatedAt,
      );
    });
  }

  async updateLikeForPost(id: string, newStatusLike: likeStatus) {
    const query = `
    UPDATE public."LikeForPost"
        SET "statusLike"= $2, "updatedAt"= $3
        WHERE id = $1;
    `;

    await this.dataSource.query(query, [id, newStatusLike, new Date()]);
  }

  async updateLikeForComment(id: string, newStatusLike: likeStatus) {
    const query = `
    UPDATE public."LikeForComment"
        SET "statusLike"= $2, "updatedAt"= $3
        WHERE id = $1;
    `;

    await this.dataSource.query(query, [id, newStatusLike, new Date()]);
  }
}
