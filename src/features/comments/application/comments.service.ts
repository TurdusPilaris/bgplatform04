import { Injectable } from '@nestjs/common';
import { PostsRepository } from '../../posts/infrastructure/posts.repository';
import { InterlayerNotice } from '../../../base/models/Interlayer';
import { UsersRepository } from '../../users/infrastructure/users.repository';
import { InjectModel } from '@nestjs/mongoose';
import {
  Comment,
  CommentDocument,
  CommentModelType,
} from '../domain/entities/comment.entity';
import { CommentsRepository } from '../infrastructure/comments.repository';
import { Like, LikeModelType } from '../domain/entities/like.entity';

@Injectable()
export class CommentsService {
  constructor(
    protected postsRepository: PostsRepository,
    protected usersRepository: UsersRepository,
    protected commentsRepository: CommentsRepository,
    @InjectModel(Comment.name)
    private CommentModel: CommentModelType,
    @InjectModel(Like.name)
    private LikeModel: LikeModelType,
  ) {}

  async createComment(
    comment: string,
    postId: string,
    userId: string,
  ): Promise<InterlayerNotice<CommentDocument | null>> {
    const foundedPost = await this.postsRepository.findById(postId);
    if (!foundedPost) {
      const result = new InterlayerNotice(null);
      result.addError('Post is not exists', 'postId', 404);
      return result;
    }

    const user = await this.usersRepository.findById(userId);

    const newComment = await this.commentsRepository.createComment(
      comment,
      postId,
      user.id,
      user.accountData.userName,
    );

    // const commentForOutput = CommentOutputModelMapper(newComment);
    //
    // console.log('commentForOutput', commentForOutput);
    return new InterlayerNotice(newComment);

    // const commentForOutput = await
  }

  async createLike(
    likeStatus: string,
    postId: string,
    userId: string,
  ): Promise<InterlayerNotice> {
    const newStatusLike = likeStatus[likeStatus];

    if (!newStatusLike) {
      const result = new InterlayerNotice(null);
      result.addError('Invalid field', 'postId', 400);
      return result;
    }

    const foundedPost = await this.postsRepository.findById(postId);
    if (!foundedPost) {
      const result = new InterlayerNotice(null);
      result.addError('Post is not exists', 'postId', 404);
      return result;
    }

    const foundedLikes = await this.commentsRepository.findLikesByUserAndParent(
      postId,
      userId,
    );

    const user = await this.usersRepository.findById(userId);

    //проверяем был ли создан лайк
    if (!foundedLikes) {
      //если нет, то создаем новый лайк и сохраняем его
      const newLike = this.LikeModel.createNewLike(
        this.LikeModel,
        postId,
        userId,
        user.accountData.userName,
        newStatusLike,
      );
      await this.commentsRepository.saveLikes(newLike);

      //в пост добавляем количество лайков по статусу

      const lastThreeLikes =
        await this.commentsRepository.findThreeLastLikesByParent(postId);

      console.log('lastThreeLikes----------------', lastThreeLikes);

      let resultLastThreeLikes: {
        addedAt: Date;
        login: string;
        userId: string;
      }[] = [];

      if (lastThreeLikes) {
        resultLastThreeLikes = lastThreeLikes.map(function (newestLikes) {
          return {
            userId: newestLikes.userID,
            addedAt: newestLikes.updatedAt,
            login: newestLikes.login,
          };
        });
      }

      await foundedPost.addCountLikes(newStatusLike, resultLastThreeLikes);
      await this.postsRepository.save(foundedPost);

      return new InterlayerNotice();
    } else {
      //сохранили старый статус лайка для пересчета в комментарии
      const oldStatusLike = foundedLikes.statusLike;

      //установили новый статус лайка и обновили дату изменения лайка
      foundedLikes.putNewLike(newStatusLike);
      await this.commentsRepository.saveLikes(foundedLikes);

      //пересчитаем количество если отличаются новй статус от старого
      if (oldStatusLike !== newStatusLike) {
        const lastThreeLikes =
          await this.commentsRepository.findThreeLastLikesByParent(postId);

        console.log('lastThreeLikes----------------', lastThreeLikes);
        let resultLastThreeLikes: {
          addedAt: Date;
          login: string;
          userId: string;
        }[] = [];

        if (lastThreeLikes) {
          resultLastThreeLikes = lastThreeLikes.map(function (newestLikes) {
            return {
              userId: newestLikes.userID,
              addedAt: newestLikes.updatedAt,
              login: newestLikes.login,
            };
          });
        }
        await foundedPost.recountLikes(
          oldStatusLike,
          newStatusLike,
          resultLastThreeLikes,
        );
        await this.postsRepository.save(foundedPost);
      }

      return new InterlayerNotice();
    }
  }
}
