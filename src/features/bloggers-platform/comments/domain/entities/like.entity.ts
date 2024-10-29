import { HydratedDocument, Model } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { likeStatus } from '../../../../../base/models/likesStatus';

export type LikeDocument = HydratedDocument<Like>;

@Schema()
export class Like {
  @Prop()
  parentID: string;

  @Prop()
  userID: string;

  @Prop()
  login: string;

  @Prop({ type: String, default: likeStatus.None, enum: likeStatus })
  statusLike: likeStatus;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  static createNewLike(
    LikeModel: LikeModelType,
    parentID: string,
    userID: string,
    login: string,
    statusLike: likeStatus,
  ) {
    const createdLike = new LikeModel({
      parentID: parentID,
      userID: userID,
      login: login,
      statusLike: statusLike,

      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return createdLike;
  }

  putNewLike(newStatusLike: likeStatus) {
    this.statusLike = newStatusLike;
    this.updatedAt = new Date();
  }
}

export type LikeModelStaticType = {
  createNewLike: (
    LikeModel: LikeModelType,
    parentID: string,
    userID: string,
    login: string,
    statusLike: likeStatus,
  ) => LikeDocument;
};

export const LikeSchema = SchemaFactory.createForClass(Like);

LikeSchema.statics = {
  createNewLike: Like.createNewLike,
} as LikeModelStaticType;

LikeSchema.methods = {
  putNewLike: Like.prototype.putNewLike,
};
export type LikeModelType = Model<LikeDocument> & LikeModelStaticType;
