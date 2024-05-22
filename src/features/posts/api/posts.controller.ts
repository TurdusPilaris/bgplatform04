import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Res,
  ValidationPipe,
} from '@nestjs/common';
import { PostsService } from '../application/posts.service';
import { InjectModel } from '@nestjs/mongoose';
import { PostModelType } from '../domain/entiities/post.entity';
import { PostCreateInputModel } from './models/input/create-post.input.model';
import { Response } from 'express';
import { QueryPostInputModel } from './models/input/query-post.model';
import { PostsQueryRepository } from '../infrastructure/posts.query-repository';

@Controller('posts')
export class PostsController {
  constructor(
    protected postsService: PostsService,
    protected postsQueryRepository: PostsQueryRepository,
    @InjectModel(Post.name)
    private PostModel: PostModelType,
  ) {}

  @Post()
  async createPost(@Body() inputModel: PostCreateInputModel) {
    const result = await this.postsService.create(inputModel);

    if (result.hasError()) {
      if (result.code === 404) {
        throw new NotFoundException();
      }
    } else {
      return result.data;
    }
  }

  @Get()
  async getPosts(
    @Query(new ValidationPipe({ transform: true }))
    queryDto: QueryPostInputModel,
  ) {
    return await this.postsQueryRepository.findAll(queryDto);
  }

  @Get(':id')
  async getPost(@Param('id') postId: string) {
    const foundedPost = await this.postsQueryRepository.findById(postId);
    if (!foundedPost) {
      throw new NotFoundException();
    } else {
      return foundedPost;
    }
  }

  @Put(':id')
  async updatePost(
    @Param('id') postId: string,
    @Body() inputModel: PostCreateInputModel,
  ) {
    const result = await this.postsService.updatePost(postId, inputModel);

    if (result.hasError()) {
      if (result.code === 404) {
        throw new NotFoundException();
      }
    }
  }

  @Delete(':id')
  async deletePost(@Param('id') postId: string) {
    const result = await this.postsService.deletePost(postId);
    if (result.hasError()) {
      if (result.code === 404) {
        throw new NotFoundException();
      }
    }
  }
}
