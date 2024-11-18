import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateCommentInputModel } from '../../api/model/input/create-comment.input.model';
import { InterlayerNotice } from '../../../../../base/models/Interlayer';
import { CommentsSqlRepository } from '../../infrastructure/comments.sql.repository';

export class UpdateCommentCommand {
  constructor(
    public inputModel: CreateCommentInputModel,
    public commentId: string,
    public userId: string,
  ) {}
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCase
  implements ICommandHandler<UpdateCommentCommand>
{
  constructor(private commentsSqlRepository: CommentsSqlRepository) {}

  async execute(command: UpdateCommentCommand): Promise<InterlayerNotice> {
    const foundedComment = await this.commentsSqlRepository.findCommentById(
      command.commentId,
    );

    if (!foundedComment) {
      const result = new InterlayerNotice(null);
      result.addError('Comment is not exists', 'commentId', 404);
      return result;
    }

    if (foundedComment.commentatorId !== command.userId) {
      const result = new InterlayerNotice(null);
      result.addError('You are not owner', 'user', 403);
      return result;
    }

    await this.commentsSqlRepository.updateComment(
      foundedComment.id,
      command.inputModel.content,
    );

    return new InterlayerNotice();
  }
}
