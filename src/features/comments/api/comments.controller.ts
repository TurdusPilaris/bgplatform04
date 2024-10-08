import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Put,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CommentsService } from '../application/comments.service';

import { CommentsRepository } from '../infrastructure/comments.repository';
import { CommentsQueryRepository } from '../infrastructure/comments.query-repository';
import { GetOptionalUserGard } from '../../../infrastructure/guards/get-optional-user-gard.service';
import { AuthBearerGuard } from '../../../infrastructure/guards/auth.bearer.guard';
import { PostCreateInputModel } from '../../posts/api/models/input/create-post.input.model';
import { CreateCommentInputModel } from './model/input/create-comment.input.model';
import { CreateLikeInputModel } from './model/input/create-like.input.model';

@Controller('comments')
export class CommentsController {
  constructor(
    private commandBus: CommandBus,
    protected commentsService: CommentsService,
    protected commentsRepository: CommentsRepository,
    protected commentsQueryRepository: CommentsQueryRepository,
  ) {}

  @UseGuards(GetOptionalUserGard)
  @Get(':id')
  async getCommentByID(@Param('id') commentId: string, @Req() req) {
    const foundedComment =
      await this.commentsQueryRepository.findCommentWithLikesForOutput(
        commentId,
        req.userId,
      );

    if (!foundedComment) {
      throw new NotFoundException();
    }

    return foundedComment;
  }

  @UseGuards(AuthBearerGuard)
  @HttpCode(204)
  @Put(':id')
  async updateComment(
    @Param('id') commentId: string,
    @Body() inputModel: CreateCommentInputModel,
    @Req() req,
  ) {
    const result = await this.commentsService.updateComment(
      inputModel,
      commentId,
      req.userId,
    );

    if (result.hasError()) {
      if (result.code === 404) {
        throw new NotFoundException();
      }
      if (result.code === 403) {
        throw new ForbiddenException();
      }
    }
  }

  @UseGuards(AuthBearerGuard)
  @HttpCode(204)
  @Put(':id/like-status')
  async updateLikeForComment(
    @Param('id') commentId: string,
    @Body() inputModel: CreateLikeInputModel,
    @Req() req,
  ) {
    const result = await this.commentsService.updateLikeStatus(
      commentId,
      req.userId,
      inputModel.likeStatus,
    );

    if (result.hasError()) {
      if (result.code === 404) {
        throw new NotFoundException();
      }
      if (result.code === 400) {
        throw new BadRequestException(result.extensions);
      }
    }
  }

  @UseGuards(AuthBearerGuard)
  @HttpCode(204)
  @Delete(':id')
  async deleteComment(@Param('id') commentId: string, @Req() req) {
    const result = await this.commentsService.deleteComment(
      commentId,
      req.userId,
    );

    if (result.hasError()) {
      if (result.code === 404) {
        throw new NotFoundException();
      }
      if (result.code === 403) {
        throw new ForbiddenException();
      }
    }
  }
}
