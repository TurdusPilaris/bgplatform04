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
  UseGuards,
  ValidationPipe,
  BadRequestException,
} from '@nestjs/common';
import { PostCreateInputModel } from './models/input/create-post.input.model';
import { QueryPostInputModel } from './models/input/query-post.model';
import { PostsQueryRepository } from '../infrastructure/posts.query-repository';
import { CreateCommentInputModel } from '../../comments/api/model/input/create-comment.input.model';
import { AuthBearerGuard } from '../../../infrastructure/guards/auth.bearer.guard';
import { AuthBasicGuard } from '../../../infrastructure/guards/auth.basic.guard';
import { QueryCommentModel } from '../../comments/api/model/input/query-comment.model';
import { CommentsQueryRepository } from '../../comments/infrastructure/comments.query-repository';
import { CreateLikeInputModel } from '../../comments/api/model/input/create-like.input.model';
import { GetOptionalUserGard } from '../../../infrastructure/guards/get-optional-user-gard.service';
import { CommandBus } from '@nestjs/cqrs';
import { CreatePostCommand } from '../application/use-cases/create-post-use-case';
import { UpdatePostCommand } from '../application/use-cases/update-post-use-case';
import { DeletePostCommand } from '../application/use-cases/delete-post-use-case';
import { CreateLikeCommand } from '../../comments/application/use-cases/create-like-use-case';
import { CreateCommentCommand } from '../../comments/application/use-cases/create-comment-use-case';

@Controller('posts')
export class PostsController {
  constructor(
    private commandBus: CommandBus,
    protected postsQueryRepository: PostsQueryRepository,
    protected commentsQueryRepository: CommentsQueryRepository,
  ) {}

  @UseGuards(AuthBasicGuard)
  @Post()
  async createPost(@Body() inputModel: PostCreateInputModel) {
    const result = await this.commandBus.execute(
      new CreatePostCommand(inputModel),
    );
    if (result.hasError()) {
      if (result.code === 404) {
        throw new NotFoundException();
      }
    } else {
      return result.data;
    }
  }

  @UseGuards(GetOptionalUserGard)
  @Get()
  async getPosts(
    @Query(new ValidationPipe({ transform: true }))
    queryDto: QueryPostInputModel,
    @Req() req: any,
  ) {
    return await this.postsQueryRepository.findAll(queryDto, req.userId);
  }

  @UseGuards(GetOptionalUserGard)
  @Get(':id')
  async getPost(@Param('id') postId: string, @Req() req: any) {
    const foundedPost = await this.postsQueryRepository.findById(
      postId,
      req.userId,
    );
    if (!foundedPost) {
      throw new NotFoundException();
    } else {
      return foundedPost;
    }
  }

  @HttpCode(204)
  @UseGuards(AuthBasicGuard)
  @Put(':id')
  async updatePost(
    @Param('id') postId: string,
    @Body() inputModel: PostCreateInputModel,
  ) {
    const result = await this.commandBus.execute(
      new UpdatePostCommand(inputModel, postId),
    );

    if (result.hasError()) {
      if (result.code === 404) {
        throw new NotFoundException();
      }
    }
  }

  @UseGuards(AuthBasicGuard)
  @HttpCode(204)
  @Delete(':id')
  async deletePost(@Param('id') postId: string) {
    const result = await this.commandBus.execute(new DeletePostCommand(postId));
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
    @Req() req: any,
  ) {
    const result = await this.commandBus.execute(
      new CreateCommentCommand(inputModel.content, postId, req.userId),
    );

    if (result.hasError()) {
      if (result.code === 404) {
        throw new NotFoundException();
      }
    } else {
      return result.data;
    }
  }

  @UseGuards(GetOptionalUserGard)
  @HttpCode(200)
  @Get(':id/comments')
  async getCommentsForPostId(
    @Query() queryDto: QueryCommentModel,
    @Param('id') postId: string,
    @Req() req: any,
  ) {
    const post = await this.postsQueryRepository.findById(postId, req.userId);

    if (!post) {
      throw new NotFoundException();
    }
    return await this.commentsQueryRepository.findAll(
      queryDto,
      postId,
      req.userId,
    );
  }

  @HttpCode(204)
  @UseGuards(AuthBearerGuard)
  @Put(':id/like-status')
  async makeLikeCommentForPostID(
    @Body() inputModel: CreateLikeInputModel,
    @Param('id') postId: string,
    @Req() req: any,
  ) {
    const result = await this.commandBus.execute(
      new CreateLikeCommand(inputModel.likeStatus, postId, req.userId),
    );

    if (result.hasError()) {
      if (result.code === 404) {
        throw new NotFoundException();
      }
      if (result.code === 400) {
        throw new BadRequestException(result.extensions);
      }
    } else {
      return result.data;
    }
  }
}
