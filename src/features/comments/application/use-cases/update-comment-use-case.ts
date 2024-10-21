import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { CreateCommentInputModel } from '../../api/model/input/create-comment.input.model';
import { InterlayerNotice } from '../../../../base/models/Interlayer';

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
  constructor(private commentsRepository: CommentsRepository) {}

  async execute(command: UpdateCommentCommand): Promise<InterlayerNotice> {
    const foundedComment = await this.commentsRepository.findCommentById(
      command.commentId,
    );

    if (!foundedComment) {
      const result = new InterlayerNotice(null);
      result.addError('Comment is not exists', 'commentId', 404);
      return result;
    }

    if (foundedComment.commentatorInfo.userId !== command.userId) {
      const result = new InterlayerNotice(null);
      result.addError('You are not owner', 'user', 403);
      return result;
    }

    await this.commentsRepository.updateComment(
      foundedComment,
      command.inputModel,
    );

    return new InterlayerNotice();
  }
}
