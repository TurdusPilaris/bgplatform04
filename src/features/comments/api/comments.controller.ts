import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CommentsService } from '../application/comments.service';

import { CommentsRepository } from '../infrastructure/comments.repository';
import { CommentsQueryRepository } from '../infrastructure/comments.query-repository';
import { AddUserWithoutAuthGuard } from '../../../infrastructure/guards/addUserWithoutAuth.guard';

@Controller('comments')
export class CommentsController {
  constructor(
    private commandBus: CommandBus,
    protected commentsService: CommentsService,
    protected commentsRepository: CommentsRepository,
    protected commentsQueryRepository: CommentsQueryRepository,
  ) {}

  @UseGuards(AddUserWithoutAuthGuard)
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
}
