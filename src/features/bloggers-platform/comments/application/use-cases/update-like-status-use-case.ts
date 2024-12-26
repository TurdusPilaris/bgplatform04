import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InterlayerNotice } from '../../../../../base/models/Interlayer';
import { likeStatus } from '../../../../../base/models/likesStatus';
import { CommentsSqlRepository } from '../../infrastructure/sql/comments.sql.repository';
import { LikesSqlRepository } from '../../../likes/infrastructure/likes.sql.repository';
import { CommentsTorRepository } from '../../infrastructure/tor/comments.tor.repository';
import { LikesTorRepository } from '../../../likes/infrastructure/likes.tor.repository';
import { LikeForCommentSQL } from '../../../likes/domain/entities/tor/likeForComment';

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
    private commentsTorRepository: CommentsTorRepository,
    private likesTorRepository: LikesTorRepository,
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

    const comment = await this.commentsTorRepository.findCommentById(
      command.commentId,
    );

    if (!comment) {
      const result = new InterlayerNotice(null);
      result.addError('Invalid field', 'comment', 404);
      return result;
    }

    const foundLike = await this.likesTorRepository.findLikeByUserAndComment(
      command.commentId,
      command.userId,
    );

    //проверяем был ли создан лайк
    if (!foundLike) {
      //если нет, то создаем новый лайк и сохраняем его
      return await this.createNewLike(
        command.commentId,
        command.userId,
        newStatusLike,
      );
    } else {
      //установили новый статус лайка и обновили дату изменения лайка
      await this.likesTorRepository.updateLikeForComment(
        foundLike.id,
        newStatusLike,
      );
    }

    return new InterlayerNotice();
  }

  async createNewLike(
    commentId: string,
    userId: string,
    newStatusLike: likeStatus,
  ): Promise<InterlayerNotice> {
    //если нет, то создаем новый лайк и сохраняем его
    const newLike = LikeForCommentSQL.create(commentId, userId, newStatusLike);
    await this.likesTorRepository.createLikeForComment(newLike);

    return new InterlayerNotice();
  }
}
