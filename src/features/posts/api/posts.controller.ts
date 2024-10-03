import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Put,
  Query,
  Req,
  Post,
  Res,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { PostsService } from '../application/posts.service';
import { InjectModel } from '@nestjs/mongoose';
import { PostClass, PostModelType } from '../domain/entiities/post.entity';
import { PostCreateInputModel } from './models/input/create-post.input.model';
import { Response } from 'express';
import { QueryPostInputModel } from './models/input/query-post.model';
import { PostsQueryRepository } from '../infrastructure/posts.query-repository';
import { CreateCommentInputModel } from '../../comments/api/model/input/create-comment.input.model';
import { CommentsService } from '../../comments/application/comments.service';
import { AuthBearerGuard } from '../../../infrastructure/guards/auth.bearer.guard';
import { AuthBasicGuard } from '../../../infrastructure/guards/auth.basic.guard';
import { QueryCommentModel } from '../../comments/api/model/input/query-comment.model';
import { CommentsQueryRepository } from '../../comments/infrastructure/comments.query-repository';
import { CreateLikeInputModel } from '../../comments/api/model/input/create-like.input.model';

@Controller('posts')
export class PostsController {
  constructor(
    protected postsService: PostsService,
    protected postsQueryRepository: PostsQueryRepository,
    protected commentsService: CommentsService,
    protected commentsQueryRepository: CommentsQueryRepository,
    @InjectModel(PostClass.name)
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

  @HttpCode(201)
  @UseGuards(AuthBearerGuard)
  @Post(':id/comments')
  async createCommentForPostID(
    @Body() inputModel: CreateCommentInputModel,
    @Param('id') postId: string,
    @Req() req,
  ) {
    const result = await this.commentsService.createComment(
      inputModel.content,
      postId,
      req.userId,
    );

    if (result.hasError()) {
      if (result.code === 404) {
        throw new NotFoundException();
      }
    } else {
      return result.data;
    }
  }

  @HttpCode(200)
  @Get(':id/comments')
  async getCommentsForPostId(
    @Query() queryDto: QueryCommentModel,
    @Param('id') postId: string,
  ) {
    const post = this.postsQueryRepository.findById(postId);

    if (!post) {
      throw new NotFoundException();
    }
    return await this.commentsQueryRepository.findAll(queryDto, postId);
  }

  @HttpCode(204)
  @UseGuards(AuthBearerGuard)
  @Post(':id/like-status')
  async makeLikeCommentForPostID(
    @Body() inputModel: CreateLikeInputModel,
    @Param('id') postId: string,
    @Req() req,
  ) {
    const result = await this.commentsService.createLike(
      inputModel.likeStatus,
      postId,
      req.userId,
    );

    if (result.hasError()) {
      if (result.code === 404) {
        throw new NotFoundException();
      }
    } else {
      return result.data;
    }
  }
}
