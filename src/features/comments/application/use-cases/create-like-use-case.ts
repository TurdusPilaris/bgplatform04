import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InterlayerNotice } from '../../../../base/models/Interlayer';
import { PostsRepository } from '../../../posts/infrastructure/posts.repository';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { likeStatus } from '../../../../base/models/likesStatus';

export class CreateLikeCommand {
  constructor(
    public likeStatusFromDto: string,
    public postId: string,
    public userId: string,
  ) {}
}
@CommandHandler(CreateLikeCommand)
export class CreateLikeUseCase implements ICommandHandler<CreateLikeCommand> {
  constructor(
    private postsRepository: PostsRepository,
    private commentsRepository: CommentsRepository,
    private usersRepository: UsersRepository,
  ) {}

  async execute(command: CreateLikeCommand): Promise<InterlayerNotice> {
    const newStatusLike = likeStatus[command.likeStatusFromDto];

    if (!newStatusLike) {
      const result = new InterlayerNotice(null);
      result.addError('Invalid field', 'likeStatus', 400);
      return result;
    }

    const foundedPost = await this.postsRepository.findById(command.postId);

    if (!foundedPost) {
      const result = new InterlayerNotice(null);
      result.addError('Post is not exists', 'postId', 404);
      return result;
    }

    const foundedLikes = await this.commentsRepository.findLikesByUserAndParent(
      command.postId,
      command.userId,
    );

    const user = await this.usersRepository.findById(command.userId);

    //проверяем был ли создан лайк
    if (!foundedLikes) {
      //если нет, то создаем новый лайк и сохраняем его
      await this.commentsRepository.createLike(
        command.postId,
        command.userId,
        user.accountData.userName,
        newStatusLike,
      );
      //в пост добавляем количество лайков по статусу

      const lastThreeLikes =
        await this.commentsRepository.findThreeLastLikesByParent(
          command.postId,
        );

      let resultLastThreeLikes: {
        addedAt: Date;
        login: string;
        userId: string;
      }[] = [];

      if (lastThreeLikes) {
        resultLastThreeLikes = lastThreeLikes.map(function (newestLikes) {
          return {
            userId: newestLikes.userID,
            addedAt: newestLikes.updatedAt,
            login: newestLikes.login,
          };
        });
      }
      await foundedPost.addCountLikes(newStatusLike, resultLastThreeLikes);
      await this.postsRepository.save(foundedPost);

      return new InterlayerNotice();
    } else {
      //сохранили старый статус лайка для пересчета в комментарии
      const oldStatusLike = foundedLikes.statusLike;

      //установили новый статус лайка и обновили дату изменения лайка
      foundedLikes.putNewLike(newStatusLike);
      await this.commentsRepository.saveLikes(foundedLikes);

      //пересчитаем количество если отличаются новй статус от старого
      if (oldStatusLike !== newStatusLike) {
        const lastThreeLikes =
          await this.commentsRepository.findThreeLastLikesByParent(
            command.postId,
          );

        let resultLastThreeLikes: {
          addedAt: Date;
          login: string;
          userId: string;
        }[] = [];

        if (lastThreeLikes) {
          resultLastThreeLikes = lastThreeLikes.map(function (newestLikes) {
            return {
              userId: newestLikes.userID,
              addedAt: newestLikes.updatedAt,
              login: newestLikes.login,
            };
          });
        }
        await foundedPost.recountLikes(
          oldStatusLike,
          newStatusLike,
          resultLastThreeLikes,
        );
        await this.postsRepository.save(foundedPost);
      }

      return new InterlayerNotice();
    }
  }
}
