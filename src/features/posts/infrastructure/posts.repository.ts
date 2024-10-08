import { Injectable, Post } from '@nestjs/common';
import {
  PostClass,
  PostDocument,
  PostModelType,
} from '../domain/entiities/post.entity';
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

    console.log('newPost=========', newPost);
    return newPost.save();
  }

  async update(
    post: PostDocument,
    updateModel: PostCreateInputModel,
    blogName: string,
  ): Promise<PostDocument> {
    post.title = updateModel.title;
    post.shortDescription = updateModel.shortDescription;
    post.content = updateModel.content;
    post.blogId = updateModel.blogId;
    post.blogName = blogName;

    return this.save(post);
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
