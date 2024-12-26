import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { likeStatus } from '../../../../base/models/likesStatus';
import { LikeForPostSQL } from '../domain/entities/tor/likeForPost';
import { LikeForCommentSQL } from '../domain/entities/tor/likeForComment';

@Injectable()
export class LikesTorRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectRepository(LikeForPostSQL)
    private readonly likesForPostsRepository: Repository<LikeForPostSQL>,
    @InjectRepository(LikeForCommentSQL)
    private readonly likesForCommentsRepository: Repository<LikeForCommentSQL>,
  ) {}

  async createLikeForPost(like: LikeForPostSQL): Promise<string> {
    const createdLike = await this.likesForPostsRepository.save(like);
    return createdLike.id;
  }

  async createLikeForComment(like: LikeForCommentSQL): Promise<string> {
    const createdLike = await this.likesForCommentsRepository.save(like);
    return createdLike.id;
  }
  async findLikeByUserAndPost(postId: string, userId: string) {
    return await this.likesForPostsRepository.findOne({
      where: {
        user: { id: userId },
        post: { id: postId },
      },
    });
  }

  async findLikeByUserAndComment(
    commentId: string,
    userId: string,
  ): Promise<LikeForCommentSQL | null> {
    return await this.likesForCommentsRepository.findOne({
      where: {
        user: { id: userId },
        comment: { id: commentId },
      },
    });
  }

  async updateLikeForPost(id: string, newStatusLike: likeStatus) {
    await this.likesForPostsRepository.update(
      { id: id },
      { statusLike: newStatusLike },
    );
  }

  async updateLikeForComment(id: string, newStatusLike: likeStatus) {
    await this.likesForCommentsRepository.update(
      { id: id },
      { statusLike: newStatusLike },
    );
  }
}
