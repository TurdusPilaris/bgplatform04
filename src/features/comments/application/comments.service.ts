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
import { CreateCommentInputModel } from '../api/model/input/create-comment.input.model';
import { CommentsQueryRepository } from '../infrastructure/comments.query-repository';
import { likeStatus } from '../../../base/models/likesStatus';
import {
  CommentOutputModel,
  CommentOutputModelMapper,
} from '../api/model/output/comment.output.model';

@Injectable()
export class CommentsService {
  constructor(
    protected postsRepository: PostsRepository,
    protected usersRepository: UsersRepository,
    protected commentsRepository: CommentsRepository,
    protected commentsQueryRepository: CommentsQueryRepository,
    @InjectModel(Comment.name)
    private CommentModel: CommentModelType,
    @InjectModel(Like.name)
    private LikeModel: LikeModelType,
  ) {}

  async createComment(
    comment: string,
    postId: string,
    userId: string,
  ): Promise<InterlayerNotice<CommentOutputModel | null>> {
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

    return new InterlayerNotice(
      CommentOutputModelMapper(newComment, likeStatus.None),
    );
  }

  async createLike(
    likeStatusFromDto: string,
    postId: string,
    userId: string,
  ): Promise<InterlayerNotice> {
    const newStatusLike = likeStatus[likeStatusFromDto];

    if (!newStatusLike) {
      const result = new InterlayerNotice(null);
      result.addError('Invalid field', 'likeStatus', 400);
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

  async updateComment(dto: CreateCommentInputModel, commentId: string, userId) {
    const foundedComment =
      await this.commentsRepository.findCommentById(commentId);

    if (!foundedComment) {
      const result = new InterlayerNotice(null);
      result.addError('Comment is not exists', 'commentId', 404);
      return result;
    }

    if (foundedComment.commentatorInfo.userId !== userId) {
      const result = new InterlayerNotice(null);
      result.addError('You are not owner', 'user', 403);
      return result;
    }

    await this.commentsRepository.updateComment(foundedComment, dto);

    return new InterlayerNotice();
  }

  async updateLikeStatus(commentId: string, userId, likeStatusFromDto: string) {
    const newStatusLike = likeStatus[likeStatusFromDto];

    if (!newStatusLike) {
      const result = new InterlayerNotice(null);
      result.addError('Invalid field', 'likeStatus', 400);
      return result;
    }

    const comment =
      await this.commentsQueryRepository.findCommentById(commentId);

    if (!comment) {
      const result = new InterlayerNotice(null);
      result.addError('Invalid field', 'comment', 404);
      return result;
    }

    const foundedLikes = await this.commentsRepository.findLikesByUserAndParent(
      commentId,
      userId,
    );

    const user = await this.usersRepository.findById(userId);

    //проверяем был ли создан лайк
    if (!foundedLikes) {
      //если нет, то создаем новый лайк и сохраняем его
      const newLike = this.LikeModel.createNewLike(
        this.LikeModel,
        commentId,
        userId,
        user!.accountData.userName,
        newStatusLike,
      );

      await this.commentsRepository.saveLikes(newLike);

      //в комментарий добавляем количество лайков по статусу

      comment.addCountLikes(newStatusLike);

      await this.commentsRepository.saveComment(comment);
    } else {
      //сохранили старый статус лайка для пересчета в комментарии
      const oldStatusLike = foundedLikes.statusLike;

      //установили новый статус лайка и обновили дату изменения лайка
      foundedLikes.putNewLike(newStatusLike);
      await this.commentsRepository.saveLikes(foundedLikes);

      //пересчитаем количество если отличаются новй статус от старого
      if (oldStatusLike !== newStatusLike) {
        comment.recountLikes(oldStatusLike, newStatusLike);
        await this.commentsRepository.saveComment(comment);
      }
    }

    return new InterlayerNotice();
  }

  async deleteComment(commentId: string, userId) {
    const comment =
      await this.commentsQueryRepository.findCommentById(commentId);

    if (!comment) {
      const result = new InterlayerNotice(null);
      result.addError('Not found comment by Id', 'comment', 404);
      return result;
    }

    if (comment.commentatorInfo.userId !== userId) {
      const result = new InterlayerNotice(null);
      result.addError('You are not owner', 'user', 403);
      return result;
    }

    await this.commentsRepository.deleteComment(commentId);

    return new InterlayerNotice();
  }
}
