import { Injectable, Post } from '@nestjs/common';
import { PostClass, PostDocument, PostModelType } from "../domain/entiities/post.entity";
import { PostCreateInputModel } from '../api/models/input/create-post.input.model';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectModel(PostClass.name)
    private PostModel: PostModelType,
  ) {}
  async createPost(
    inputModel: PostCreateInputModel,
    blogName: string,
  ): Promise<PostDocument> {
    const newPost = this.PostModel.createNewPost(
      inputModel,
      this.PostModel,
      blogName,
    );
    return newPost.save();
  }
  async save(post: PostDocument) {
    return post.save();
  }

  async findById(postId: string): Promise<PostDocument | null> {
    const post = await this.PostModel.findById(postId, { __v: false });
    if (!post) return null;
    return post;
  }

  async delete(postId: string) {
    return this.PostModel.deleteOne({
      _id: new Types.ObjectId(postId),
    });
  }
}
