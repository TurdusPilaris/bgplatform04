import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { InterlayerNotice } from '../../../../../base/models/Interlayer';

export class DeleteCommentCommand {
  constructor(
    public commentId: string,
    public userId: string,
  ) {}
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase
  implements ICommandHandler<DeleteCommentCommand>
{
  constructor(private commentsRepository: CommentsRepository) {}

  async execute(command: DeleteCommentCommand): Promise<InterlayerNotice> {
    const comment = await this.commentsRepository.findCommentById(
      command.commentId,
    );

    if (!comment) {
      const result = new InterlayerNotice(null);
      result.addError('Not found comment by Id', 'comment', 404);
      return result;
    }

    if (comment.commentatorInfo.userId !== command.userId) {
      const result = new InterlayerNotice(null);
      result.addError('You are not owner', 'user', 403);
      return result;
    }

    await this.commentsRepository.deleteComment(command.commentId);

    return new InterlayerNotice();
  }
}
