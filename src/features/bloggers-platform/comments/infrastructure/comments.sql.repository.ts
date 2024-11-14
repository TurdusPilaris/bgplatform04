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
import { CommentSQL } from '../api/model/sql/comment.model.sql';
import { UserSQL } from '../../../user-accaunts/users/api/models/sql/user.model.sql';
import { CommentOutputModel } from '../api/model/output/comment.output.model';

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

  async findCommentById(id: string): Promise<CommentSQL | null> {
    const query = `
      SELECT "Comments".id, "Comments"."postId", "Comments"."commentatorId", "Comments".content, "Comments"."createdAt", "Users"."userName" as "commentatorName"
        FROM public."Comments"
        LEFT JOIN "Users" ON "Users".id = "Comments"."commentatorId"
        WHERE "Comments".id = $1;
      `;

    const res: CommentSQL[] = await this.dataSource.query(query, [id]);

    if (res.length === 0) return null;

    return res[0];
  }

  async updateComment(commentId: string, content: string) {
    const query = `
    UPDATE public."Comments"
        SET content= $2
        WHERE id = $1;
    `;

    await this.dataSource.query(query, [commentId, content]);
  }

  async deleteComment(commentId: string) {
    const query = `
    DELETE FROM public."Comments"
        WHERE id = $1;
    `;

    await this.dataSource.query(query, [commentId]);
  }
}
