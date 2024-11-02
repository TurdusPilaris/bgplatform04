import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CommentsQueryRepository } from '../infrastructure/comments.query-repository';
import { CreateCommentInputModel } from './model/input/create-comment.input.model';
import { CreateLikeInputModel } from './model/input/create-like.input.model';
import { UpdateCommentCommand } from '../application/use-cases/update-comment-use-case';
import { UpdateLikeStatusCommand } from '../application/use-cases/update-like-status-use-case';
import { DeleteCommentCommand } from '../application/use-cases/delete-comment-use-case';
import { GetOptionalUserGard } from '../../../../infrastructure/guards/get-optional-user-gard.service';
import { AuthBearerGuard } from '../../../../infrastructure/guards/auth.bearer.guard';
import { ErrorProcessor } from '../../../../base/models/errorProcessor';
import { Request } from 'express';

@Controller('comments')
export class CommentsController {
  constructor(
    private commandBus: CommandBus,
    protected commentsQueryRepository: CommentsQueryRepository,
  ) {}

  @UseGuards(GetOptionalUserGard)
  @Get(':id')
  async getCommentByID(@Param('id') commentId: string, @Req() req: Request) {
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
    @Req() req: Request,
  ) {
    const result = await this.commandBus.execute(
      new UpdateCommentCommand(inputModel, commentId, req.userId),
    );

    if (result.hasError()) {
      new ErrorProcessor(result).handleError();
    }
  }

  @UseGuards(AuthBearerGuard)
  @HttpCode(204)
  @Put(':id/like-status')
  async updateLikeForComment(
    @Param('id') commentId: string,
    @Body() inputModel: CreateLikeInputModel,
    @Req() req: Request,
  ) {
    const result = await this.commandBus.execute(
      new UpdateLikeStatusCommand(commentId, req.userId, inputModel.likeStatus),
    );

    if (result.hasError()) {
      new ErrorProcessor(result).handleError();
    }
  }

  @UseGuards(AuthBearerGuard)
  @HttpCode(204)
  @Delete(':id')
  async deleteComment(@Param('id') commentId: string, @Req() req: Request) {
    const result = await this.commandBus.execute(
      new DeleteCommentCommand(commentId, req.userId),
    );

    if (result.hasError()) {
      new ErrorProcessor(result).handleError();
    }
  }
}
