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

@Injectable()
export class PostsService {
  constructor(
    private postsRepository: PostsRepository,
    private postsQueryRepository: PostsQueryRepository,
    private blogsQueryRepository: BlogsQueryRepository,
  ) {}
  async create(inputModel: PostCreateInputModel) {
    const foundedBlog = await this.blogsQueryRepository.findById(
      inputModel.blogId,
    );
    if (!foundedBlog) {
      const result = new InterlayerNotice(null);
      result.addError('Blog is not exists', 'blogId', 404);
      return result;
    }

    const outputPostModel = PostOutputModelMapper(
      await this.postsRepository.createPost(inputModel, foundedBlog.name),
    );

    return new InterlayerNotice(outputPostModel);
  }

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

    foundedPost.title = inputModel.title;
    foundedPost.shortDescription = inputModel.shortDescription;
    foundedPost.content = inputModel.content;
    foundedPost.blogId = inputModel.blogId;
    foundedPost.blogName = foundedBlog.name;

    const resultUpdatedPost = await this.postsRepository.save(foundedPost);

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
