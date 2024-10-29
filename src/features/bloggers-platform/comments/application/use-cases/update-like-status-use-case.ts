import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { UsersRepository } from '../../../../userAccaunts/users/infrastructure/users.repository';
import { InterlayerNotice } from '../../../../../base/models/Interlayer';
import { likeStatus } from '../../../../../base/models/likesStatus';

export class UpdateLikeStatusCommand {
  constructor(
    public commentId: string,
    public userId: string,
    public likeStatusFromDto: string,
  ) {}
}

@CommandHandler(UpdateLikeStatusCommand)
export class UpdateLikeStatusUseCase
  implements ICommandHandler<UpdateLikeStatusCommand>
{
  constructor(
    private commentsRepository: CommentsRepository,
    private usersRepository: UsersRepository,
  ) {}

  async execute(command: UpdateLikeStatusCommand): Promise<InterlayerNotice> {
    const newStatusLike = likeStatus[command.likeStatusFromDto];

    if (!newStatusLike) {
      const result = new InterlayerNotice(null);
      result.addError('Invalid field', 'likeStatus', 400);
      return result;
    }

    const comment = await this.commentsRepository.findCommentById(
      command.commentId,
    );

    if (!comment) {
      const result = new InterlayerNotice(null);
      result.addError('Invalid field', 'comment', 404);
      return result;
    }

    const foundedLikes = await this.commentsRepository.findLikesByUserAndParent(
      command.commentId,
      command.userId,
    );

    const user = await this.usersRepository.findById(command.userId);

    //проверяем был ли создан лайк
    if (!foundedLikes) {
      //если нет, то создаем новый лайк и сохраняем его
      await this.commentsRepository.createLike(
        command.commentId,
        command.userId,
        user.accountData.userName,
        newStatusLike,
      );

      //в комментарий добавляем количество лайков по статусу

      comment.addCountLikes(newStatusLike);

      await this.commentsRepository.saveComment(comment);
    } else {
      //сохранили старый статус лайка для пересчета в комментарии
      const oldStatusLike = foundedLikes.statusLike;

      //установили новый статус лайка и обновили дату изменения лайка
      foundedLikes.putNewLike(newStatusLike);
      await this.commentsRepository.saveLikes(foundedLikes);

      //пересчитаем количество если отличаются новй статус от старого
      if (oldStatusLike !== newStatusLike) {
        comment.recountLikes(oldStatusLike, newStatusLike);
        await this.commentsRepository.saveComment(comment);
      }
    }

    return new InterlayerNotice();
  }
}
