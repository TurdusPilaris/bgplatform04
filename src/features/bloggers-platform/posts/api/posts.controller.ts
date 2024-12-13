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
  ParseUUIDPipe,
} from '@nestjs/common';
import { PostCreateInputModel } from './models/input/create-post.input.model';
import { QueryPostInputModel } from './models/input/query-post.model';
import { CreateCommentInputModel } from '../../comments/api/model/input/create-comment.input.model';
import { QueryCommentModel } from '../../comments/api/model/input/query-comment.model';
import { CreateLikeInputModel } from '../../likes/api/model/input/create-like.input.model';
import { CommandBus } from '@nestjs/cqrs';
import { CreatePostCommand } from '../application/use-cases/create-post-use-case';
import { UpdatePostCommand } from '../application/use-cases/update-post-use-case';
import { DeletePostCommand } from '../application/use-cases/delete-post-use-case';
import { CreateLikeForPostCommand } from '../../comments/application/use-cases/create-like-use-case';
import { CreateCommentCommand } from '../../comments/application/use-cases/create-comment-use-case';
import { AuthBasicGuard } from '../../../../infrastructure/guards/auth.basic.guard';
import { GetOptionalUserGard } from '../../../../infrastructure/guards/get-optional-user-gard.service';
import { AuthBearerGuard } from '../../../../infrastructure/guards/auth.bearer.guard';
import { ErrorProcessor } from '../../../../base/models/errorProcessor';
import { Request } from 'express';
import { PostsSqlQueryRepository } from '../infrastructure/sql/posts.sql.query-repository';
import { CommentsSqlQueryRepository } from '../../comments/infrastructure/comments.sql.query-repository';
import { PostsTorQueryRepository } from '../infrastructure/tor/posts.tor.query-repository';

@Controller('posts')
export class PostsController {
  constructor(
    private commandBus: CommandBus,
    protected postsSqlQueryRepository: PostsSqlQueryRepository,
    protected postsTorQueryRepository: PostsTorQueryRepository,
    protected commentsSqlQueryRepository: CommentsSqlQueryRepository,
  ) {}

  @UseGuards(GetOptionalUserGard)
  @Get()
  async getPosts(
    @Query()
    queryDto: QueryPostInputModel,
    @Req() req: Request,
  ) {
    return await this.postsTorQueryRepository.findAll(queryDto, req.userId);
  }

  @UseGuards(GetOptionalUserGard)
  @Get(':id')
  async getPost(
    @Param('id', new ParseUUIDPipe()) postId: string,
    @Req() req: Request,
  ) {
    const foundedPost = await this.postsTorQueryRepository.findById(
      postId,
      req.userId,
    );
    if (!foundedPost) {
      throw new NotFoundException();
    } else {
      return foundedPost;
    }
  }

  @UseGuards(GetOptionalUserGard)
  @HttpCode(200)
  @Get(':id/comments')
  async getCommentsForPostId(
    @Query() queryDto: QueryCommentModel,
    @Param('id', new ParseUUIDPipe()) postId: string,
    @Req() req: Request,
  ) {
    const post = await this.postsTorQueryRepository.findById(
      postId,
      req.userId,
    );

    if (!post) {
      throw new NotFoundException();
    }
    return await this.commentsSqlQueryRepository.findAll(
      queryDto,
      postId,
      req.userId,
    );
  }
  @UseGuards(AuthBasicGuard)
  @Post()
  async createPost(@Body() inputModel: PostCreateInputModel) {
    const result = await this.commandBus.execute(
      new CreatePostCommand(inputModel),
    );
    if (result.hasError()) {
      new ErrorProcessor(result).handleError();
    } else {
      return result.data;
    }
  }

  @HttpCode(201)
  @UseGuards(AuthBearerGuard)
  @Post(':id/comments')
  async createCommentForPostID(
    @Body() inputModel: CreateCommentInputModel,
    @Param('id', new ParseUUIDPipe()) postId: string,
    @Req() req: Request,
  ) {
    const result = await this.commandBus.execute(
      new CreateCommentCommand(inputModel.content, postId, req.userId),
    );

    if (result.hasError()) {
      new ErrorProcessor(result).handleError();
    } else {
      return result.data;
    }
  }

  @HttpCode(204)
  @UseGuards(AuthBasicGuard)
  @Put(':id')
  async updatePost(
    @Param('id', new ParseUUIDPipe()) postId: string,
    @Body() inputModel: PostCreateInputModel,
  ) {
    const result = await this.commandBus.execute(
      new UpdatePostCommand(inputModel, postId),
    );

    if (result.hasError()) {
      new ErrorProcessor(result).handleError();
    }
  }

  @HttpCode(204)
  @UseGuards(AuthBearerGuard)
  @Put(':id/like-status')
  async makeLikeCommentForPostID(
    @Body() inputModel: CreateLikeInputModel,
    @Param('id', new ParseUUIDPipe()) postId: string,
    @Req() req: Request,
  ) {
    const result = await this.commandBus.execute(
      new CreateLikeForPostCommand(inputModel.likeStatus, postId, req.userId),
    );

    if (result.hasError()) {
      new ErrorProcessor(result).handleError();
    } else {
      return result.data;
    }
  }

  @UseGuards(AuthBasicGuard)
  @HttpCode(204)
  @Delete(':id')
  async deletePost(@Param('id', new ParseUUIDPipe()) postId: string) {
    const result = await this.commandBus.execute(new DeletePostCommand(postId));
    if (result.hasError()) {
      new ErrorProcessor(result).handleError();
    }
  }
}
