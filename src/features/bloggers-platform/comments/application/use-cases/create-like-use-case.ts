import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../../posts/infrastructure/posts.repository';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { UsersRepository } from '../../../../userAccaunts/users/infrastructure/users.repository';
import { InterlayerNotice } from '../../../../../base/models/Interlayer';
import { likeStatus } from '../../../../../base/models/likesStatus';
import { PostDocument } from '../../../posts/domain/entiities/post.entity';

export class CreateLikeCommand {
  constructor(
    public likeStatusFromDto: likeStatus,
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
    //приводим к enum лайк
    const newStatusLike = command.likeStatusFromDto;
    // выносим переменные из команды в отедльные переменные
    const userId = command.userId;
    const postId = command.postId;

    //ищем пост
    const foundedPost = await this.postsRepository.findById(postId);

    //возвращаем ошибку если пост не найден
    if (!foundedPost) {
      const result = new InterlayerNotice(null);
      result.addError('Post is not exists', 'postId', 404);
      return result;
    }

    //ищем лайки для конкретных поста и пользователя
    const foundedLikes = await this.commentsRepository.findLikesByUserAndParent(
      postId,
      userId,
    );

    //получаем пользователя что бы забрать имя для создания нового лайка, в дальнейшем проще геты строить
    const user = await this.usersRepository.findById(userId);

    //проверяем был ли создан лайк
    if (!foundedLikes) {
      return await this.createNewLike(
        postId,
        userId,
        user.accountData.userName,
        newStatusLike,
        foundedPost,
      );
    } else {
      //сохранили старый статус лайка для пересчета в комментарии
      const oldStatusLike = foundedLikes.statusLike;

      //установили новый статус лайка и обновили дату изменения лайка
      foundedLikes.putNewLike(newStatusLike);
      await this.commentsRepository.saveLikes(foundedLikes);

      //пересчитаем количество если отличаются новй статус от старого
      if (oldStatusLike !== newStatusLike) {
        const lastThreeLikes =
          await this.commentsRepository.findThreeLastLikesByParent(postId);

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

  async createNewLike(
    postId: string,
    userId: string,
    userName: string,
    newStatusLike: likeStatus,
    foundedPost: PostDocument,
  ): Promise<InterlayerNotice> {
    //если нет, то создаем новый лайк и сохраняем его
    await this.commentsRepository.createLike(
      postId,
      userId,
      userName,
      newStatusLike,
    );
    //в пост добавляем количество лайков по статусу

    const lastThreeLikes =
      await this.commentsRepository.findThreeLastLikesByParent(postId);

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
  }
}
