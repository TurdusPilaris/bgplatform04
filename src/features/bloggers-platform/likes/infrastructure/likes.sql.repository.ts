import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { likeStatus } from '../../../../base/models/likesStatus';

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
}
