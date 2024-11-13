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
import { likeStatus } from '../../../../base/models/likesStatus';
import { DataSource } from 'typeorm';

export class CommentsSqlRepository {
  constructor(
    @InjectModel(Comment.name)
    private CommentModel: CommentModelType,
    @InjectModel(Like.name)
    private LikeModel: LikeModelType,
    protected dataSource: DataSource,
  ) {}

  async createComment(comment: string, postId: string, userId: string) {
    const query = `
    INSERT INTO public."Comments"(
        "postId", "commentatorId", content, "createdAt")
        VALUES ( $1, $2, $3, $4) RETURNING id;
    `;

    const res = await this.dataSource.query(query, [
      postId,
      userId,
      comment,
      new Date(),
    ]);

    return res[0].id;
  }

  async findLikeByUserAndParent(
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

  // async deleteComment(commentId: string) {
  //   return this.CommentModel.deleteOne({
  //     _id: new Types.ObjectId(commentId),
  //   });
  // }

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
