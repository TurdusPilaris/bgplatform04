import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InterlayerNotice } from '../../../../../base/models/Interlayer';
import { CommentsSqlRepository } from '../../infrastructure/sql/comments.sql.repository';

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
  constructor(private commentsSqlRepository: CommentsSqlRepository) {}

  async execute(command: DeleteCommentCommand): Promise<InterlayerNotice> {
    const comment = await this.commentsSqlRepository.findCommentById(
      command.commentId,
    );

    if (!comment) {
      const result = new InterlayerNotice(null);
      result.addError('Not found comment by Id', 'comment', 404);
      return result;
    }

    if (comment.commentatorId !== command.userId) {
      const result = new InterlayerNotice(null);
      result.addError('You are not owner', 'user', 403);
      return result;
    }

    await this.commentsSqlRepository.deleteComment(command.commentId);

    return new InterlayerNotice();
  }
}
