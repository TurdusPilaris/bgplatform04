import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InterlayerNotice } from '../../../../../base/models/Interlayer';
import { likeStatus } from '../../../../../base/models/likesStatus';
import { CommentsSqlRepository } from '../../infrastructure/sql/comments.sql.repository';
import { LikesSqlRepository } from '../../../likes/infrastructure/likes.sql.repository';

export class UpdateLikeStatusForCommentCommand {
  constructor(
    public commentId: string,
    public userId: string,
    public likeStatus: likeStatus,
  ) {}
}

@CommandHandler(UpdateLikeStatusForCommentCommand)
export class UpdateLikeStatusUseCase
  implements ICommandHandler<UpdateLikeStatusForCommentCommand>
{
  constructor(
    private commentsSqlRepository: CommentsSqlRepository,
    private likesSqlRepository: LikesSqlRepository,
  ) {}

  async execute(
    command: UpdateLikeStatusForCommentCommand,
  ): Promise<InterlayerNotice> {
    const newStatusLike = likeStatus[command.likeStatus];

    if (!newStatusLike) {
      const result = new InterlayerNotice(null);
      result.addError('Invalid field', 'likeStatus', 400);
      return result;
    }

    const comment = await this.commentsSqlRepository.findCommentById(
      command.commentId,
    );

    if (!comment) {
      const result = new InterlayerNotice(null);
      result.addError('Invalid field', 'comment', 404);
      return result;
    }

    const foundLike = await this.likesSqlRepository.findLikeByUserAndComment(
      command.commentId,
      command.userId,
    );

    //проверяем был ли создан лайк
    if (!foundLike) {
      //если нет, то создаем новый лайк и сохраняем его
      await this.likesSqlRepository.createLikeForComment(
        command.commentId,
        command.userId,
        newStatusLike,
      );
    } else {
      //установили новый статус лайка и обновили дату изменения лайка
      await this.likesSqlRepository.updateLikeForComment(
        foundLike.id,
        newStatusLike,
      );
    }

    return new InterlayerNotice();
  }
}
