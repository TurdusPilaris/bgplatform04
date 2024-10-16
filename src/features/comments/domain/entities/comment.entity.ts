import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
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
      createdAt: new Date(),
      likesInfo: {
        countLikes: 0,
        countDislikes: 0,
        myStatus: likeStatus.None,
      },
    });

    return createdComment;
  }

  addCountLikes(newStatusLike: likeStatus) {
    if (newStatusLike === likeStatus.Like) {
      this.likesInfo.countLikes += 1;
    }
    if (newStatusLike === likeStatus.Dislike) {
      this.likesInfo.countDislikes += 1;
    }
  }
  recountLikes(oldStatusLike: likeStatus, newStatusLike: likeStatus) {
    let countLikes = 0;
    let countDislikes = 0;

    if (oldStatusLike === likeStatus.None) {
      if (newStatusLike === likeStatus.Like) {
        countLikes = 1;
        countDislikes = 0;
      }
      if (newStatusLike === likeStatus.Dislike) {
        countLikes = 0;
        countDislikes = 1;
      }
    } else if (oldStatusLike === likeStatus.Like) {
      countLikes = -1;
      if (newStatusLike === likeStatus.None) {
        countDislikes = 0;
      }
      if (newStatusLike === likeStatus.Dislike) {
        countDislikes = 1;
      }
    } else if (oldStatusLike === likeStatus.Dislike) {
      countDislikes = -1;
      if (newStatusLike === likeStatus.None) {
        countLikes = 0;
      }
      if (newStatusLike === likeStatus.Like) {
        countLikes = 1;
      }
    }

    this.likesInfo.countLikes += countLikes;
    this.likesInfo.countDislikes += countDislikes;
  }
}

export type CommentModelStaticType = {
  createNewComment: (
    CommentModel: CommentModelType,
    content: string,
    postId: string,
    userId: string,
    userLogin: string,
  ) => CommentDocument;
};

export const CommentSchema = SchemaFactory.createForClass(Comment);

CommentSchema.statics = {
  createNewComment: Comment.createNewComment,
} as CommentModelStaticType;

CommentSchema.methods = {
  addCountLikes: Comment.prototype.addCountLikes,
  recountLikes: Comment.prototype.recountLikes,
};
export type CommentModelType = Model<CommentDocument> & CommentModelStaticType;
