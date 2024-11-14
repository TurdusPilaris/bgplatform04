import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { UsersRepository } from '../../../../user-accaunts/users/infrastructure/users.repository';
import { InterlayerNotice } from '../../../../../base/models/Interlayer';
import { likeStatus } from '../../../../../base/models/likesStatus';
import { UsersSqlRepository } from '../../../../user-accaunts/users/infrastructure/users.sql.repositories';
import { CommentsSqlRepository } from '../../infrastructure/comments.sql.repository';
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
    private commentsRepository: CommentsRepository,
    private commentsSqlRepository: CommentsSqlRepository,
    private usersRepository: UsersRepository,
    private usersSqlRepository: UsersSqlRepository,
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

    const user = await this.usersSqlRepository.findById(command.userId);

    //проверяем был ли создан лайк
    if (!foundLike) {
      //если нет, то создаем новый лайк и сохраняем его
      await this.likesSqlRepository.createLikeForComment(
        command.commentId,
        command.userId,
        newStatusLike,
      );

      //в комментарий добавляем количество лайков по статусу

      // comment.addCountLikes(newStatusLike);

      // await this.commentsRepository.saveComment(comment);
    } else {
      //сохранили старый статус лайка для пересчета в комментарии
      const oldStatusLike = foundLike.statusLike;

      //установили новый статус лайка и обновили дату изменения лайка
      await this.likesSqlRepository.updateLikeForPost(
        foundLike.id,
        newStatusLike,
      );

      //пересчитаем количество если отличаются новй статус от старого
      // if (oldStatusLike !== newStatusLike) {
      //   comment.recountLikes(oldStatusLike, newStatusLike);
      //   await this.commentsRepository.saveComment(comment);
      // }
    }

    return new InterlayerNotice();
  }
}
