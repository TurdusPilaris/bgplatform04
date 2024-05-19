import { Prop, Schema } from '@nestjs/mongoose';
import { likeStatus } from '../../../../base/models/likesStatus';
import { HydratedDocument, Model } from 'mongoose';

export type CommentDocument = HydratedDocument<Comment>;
@Schema({ _id: false, id: false, versionKey: false })
export class CommentatorInfo {
  @Prop()
  userId: string;

  @Prop()
  userLogin: string;
}

@Schema({ _id: false, id: false, versionKey: false })
export class CommentLikesInfo {
  @Prop()
  countLikes: number;

  @Prop()
  countDislikes: number;

  @Prop({ type: String, default: likeStatus.None, enum: likeStatus })
  myStatus: likeStatus;
}

@Schema()
export class Comment {
  @Prop()
  content: string;

  @Prop()
  postId: string;

  @Prop({ type: CommentatorInfo })
  commentatorInfo: CommentatorInfo;

  @Prop()
  createdAt: Date;

  @Prop({ type: CommentLikesInfo })
  likesInfo: CommentLikesInfo;

  static createNewComment(
    CommentModel: CommentModelType,
    content: string,
    postId: string,
    userId: string,
    userLogin: string,
  ) {
    const createdComment = new CommentModel({
      content: content,
      postId: postId,
      commentatorInfo: {
        userId: userId,
        userLogin: userLogin,
      },
    });

    return createdComment;
  }
}
export type CommentModelType = Model<CommentDocument>;
