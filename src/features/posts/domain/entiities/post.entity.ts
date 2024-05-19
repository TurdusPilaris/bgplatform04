import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { PostCreateInputModel } from '../../api/models/input/create-post.input.model';
import { likeStatus } from '../../../../base/models/likesStatus';

export type PostDocument = HydratedDocument<Post>;

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

  // @Prop({ default: likeStatus.None, type: likeStatus })
  // myStatus: {
  //   type: string;
  //   enum: ['Like', 'Dislike', 'None'];
  // };

  @Prop({ type: String, default: likeStatus.None, enum: likeStatus })
  myStatus: likeStatus;

  @Prop({ default: [], type: PostLikesInfoNewestLikes })
  newestLikes: PostLikesInfoNewestLikes;
}

@Schema()
export class Post {
  @Prop()
  title: string;
  @Prop()
  shortDescription: string;
  @Prop()
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
    });
    return createdPost;
  }
}

export type PostModelStaticType = {
  createNewPost: (
    dto: PostCreateInputModel,
    PostModel: PostModelType,
    blogName: string,
  ) => PostDocument;
};

export const PostSchema = SchemaFactory.createForClass(Post);

PostSchema.statics = {
  createNewPost: Post.createNewPost,
} as PostModelStaticType;

export type PostModelType = Model<PostDocument> & PostModelStaticType;
