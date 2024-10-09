import { Injectable } from '@nestjs/common';
import { PostsRepository } from '../infrastructure/posts.repository';
import { PostCreateInputModel } from '../api/models/input/create-post.input.model';
import {
  PostOutputModel,
  PostOutputModelMapper,
} from '../api/models/output/post.output.model';
import { BlogsQueryRepository } from '../../blogs/infrastructure/blogs.query-repository';
import { InterlayerNotice } from '../../../base/models/Interlayer';
import { PostsQueryRepository } from '../infrastructure/posts.query-repository';
import { CreatePostWithoutBlogIdInputModel } from '../api/models/input/create-post-withoutBlogId.input.model';
import { BlogsRepository } from '../../blogs/infrastructure/blogs.repository';

@Injectable()
export class PostsService {
  constructor(
    private postsRepository: PostsRepository,
    private blogsQueryRepository: BlogsQueryRepository,
  ) {}

  async updatePost(
    postId: string,
    inputModel: PostCreateInputModel,
  ): Promise<InterlayerNotice> {
    const foundedBlog = await this.blogsQueryRepository.findById(
      inputModel.blogId,
    );
    if (!foundedBlog) {
      const result = new InterlayerNotice(null);
      result.addError('Blog is not exists', 'blogId', 404);
      return result;
    }

    const foundedPost = await this.postsRepository.findById(postId);
    if (!foundedPost) {
      const result = new InterlayerNotice(null);
      result.addError('Post is not exists', 'postId', 404);
      return result;
    }

    await this.postsRepository.update(
      foundedPost,
      foundedPost,
      foundedBlog.name,
    );

    return new InterlayerNotice(null);
  }

  async deletePost(postId: string): Promise<InterlayerNotice> {
    // if post wasn't found we will return an error
    const foundedPost = await this.postsRepository.findById(postId);
    if (!foundedPost) {
      const result = new InterlayerNotice(null);
      result.addError('Post is not exists', 'postId', 404);
      return result;
    }

    //delete post
    const deletedPost = await this.postsRepository.delete(postId);

    //return information about success
    return new InterlayerNotice(null);
  }
}
