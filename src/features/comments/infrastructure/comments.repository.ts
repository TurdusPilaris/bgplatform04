import { Injectable } from '@nestjs/common';
import { Comment, CommentModelType } from '../domain/entities/comment.entity';
import { InjectModel } from '@nestjs/mongoose';
import {
  Like,
  LikeDocument,
  LikeModelType,
} from '../domain/entities/like.entity';
import { likeStatus } from '../../../base/models/likesStatus';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Comment.name)
    private CommentModel: CommentModelType,
    @InjectModel(Like.name)
    private LikeModel: LikeModelType,
  ) {}

  async createComment(
    comment: string,
    postId: string,
    userId: string,
    userName: string,
  ) {
    const newComment = this.CommentModel.createNewComment(
      this.CommentModel,
      comment,
      postId,
      userId,
      userName,
    );

    return newComment.save();
  }

  async findLikesByUserAndParent(
    parentID: string,
    userId: string,
  ): Promise<LikeDocument | null> {
    return this.LikeModel.findOne({ parentID: parentID, userID: userId });
  }

  async findThreeLastLikesByParent(
    parentID: string,
  ): Promise<LikeDocument[] | null> {
    return this.LikeModel.find({
      parentID: parentID,
      statusLike: likeStatus.Like,
    })
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();
  }

  async saveLikes(newLike: LikeDocument) {
    await newLike.save();
  }
}
