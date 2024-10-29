import {
  Comment,
  CommentDocument,
  CommentModelType,
} from '../domain/entities/comment.entity';
import { InjectModel } from '@nestjs/mongoose';
import {
  Like,
  LikeDocument,
  LikeModelType,
} from '../domain/entities/like.entity';
import { CreateCommentInputModel } from '../api/model/input/create-comment.input.model';
import { Types } from 'mongoose';
import { likeStatus } from '../../../../base/models/likesStatus';

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

  async findCommentById(id: string): Promise<CommentDocument | null> {
    return this.CommentModel.findById(id);
  }

  async updateComment(comment: CommentDocument, dto: CreateCommentInputModel) {
    comment.content = dto.content;
    await comment.save();
  }

  async saveComment(comment: CommentDocument) {
    await comment.save();
  }

  async deleteComment(commentId: string) {
    return this.CommentModel.deleteOne({
      _id: new Types.ObjectId(commentId),
    });
  }

  createLike(
    parentID: string,
    userId: string,
    userName: string,
    newStatusLike: any,
  ) {
    const newLike = this.LikeModel.createNewLike(
      this.LikeModel,
      parentID,
      userId,
      userName,
      newStatusLike,
    );
    return newLike.save();
  }
}
