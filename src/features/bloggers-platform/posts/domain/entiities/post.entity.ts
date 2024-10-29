import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { PostCreateInputModel } from '../../api/models/input/create-post.input.model';
import { likeStatus } from '../../../../../base/models/likesStatus';

export type PostDocument = HydratedDocument<PostClass>;

@Schema({ _id: false, id: false, versionKey: false })
export class PostLikesInfoNewestLikes {
  @Prop()
  addedAt: Date;

  @Prop()
  userId: string;

  @Prop()
  login: string;
}

@Schema({ _id: false, id: false, versionKey: false })
export class PostLikesInfo {
  @Prop({ default: 0 })
  countLikes: number;

  @Prop({ default: 0 })
  countDislikes: number;

  @Prop({ type: String, default: likeStatus.None, enum: likeStatus })
  myStatus: likeStatus;

  @Prop({ default: [], type: [PostLikesInfoNewestLikes] })
  newestLikes: PostLikesInfoNewestLikes[];
}

@Schema()
export class PostClass {
  @Prop({ type: String, required: true, min: 1, max: 30 })
  title: string;
  @Prop({ type: String, required: true, min: 1, max: 100 })
  shortDescription: string;
  @Prop({ type: String, required: true, min: 1, max: 1000 })
  content: string;
  @Prop()
  blogId: string;
  @Prop()
  blogName: string;
  @Prop()
  createdAt: Date;
  @Prop({ type: PostLikesInfo })
  likesInfo: PostLikesInfo;

  static createNewPost(
    dto: PostCreateInputModel,
    PostModel: PostModelType,
    blogName: string,
  ) {
    const createdPost = new PostModel({
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: dto.blogId,
      blogName: blogName,
      createdAt: new Date(),
      likesInfo: {
        countLikes: 0,
        countDislikes: 0,
        myStatus: likeStatus.None,
        newestLikes: [],
      },
    });
    return createdPost;
  }

  async addCountLikes(
    newStatusLike: likeStatus,
    resultLastThreeLikes: PostLikesInfoNewestLikes[],
  ) {
    if (newStatusLike === likeStatus.Like) {
      this.likesInfo.countLikes += 1;
    }
    if (newStatusLike === likeStatus.Dislike) {
      this.likesInfo.countDislikes += 1;
    }

    this.likesInfo.newestLikes = [];
    this.likesInfo.newestLikes.push(...resultLastThreeLikes);
  }

  async recountLikes(
    oldStatusLike: likeStatus,
    newStatusLike: likeStatus,
    resultLastThreeLikes: PostLikesInfoNewestLikes[],
  ) {
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

    this.likesInfo.newestLikes = [];
    this.likesInfo.newestLikes.push(...resultLastThreeLikes);
  }
}

export type PostModelStaticType = {
  createNewPost: (
    dto: PostCreateInputModel,
    PostModel: PostModelType,
    blogName: string,
  ) => PostDocument;
};

export const PostSchema = SchemaFactory.createForClass(PostClass);

PostSchema.statics = {
  createNewPost: PostClass.createNewPost,
} as PostModelStaticType;

PostSchema.methods = {
  addCountLikes: PostClass.prototype.addCountLikes,
  recountLikes: PostClass.prototype.recountLikes,
};
export type PostModelType = Model<PostDocument> & PostModelStaticType;
