import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InterlayerNotice } from '../../../../../base/models/Interlayer';
import { likeStatus } from '../../../../../base/models/likesStatus';
import { PostsSqlRepository } from '../../../posts/infrastructure/sql/posts.sql.repository';
import { LikesSqlRepository } from '../../../likes/infrastructure/likes.sql.repository';

export class CreateLikeForPostCommand {
  constructor(
    public likeStatusFromDto: likeStatus,
    public postId: string,
    public userId: string,
  ) {}
}
@CommandHandler(CreateLikeForPostCommand)
export class CreateLikeUseCase
  implements ICommandHandler<CreateLikeForPostCommand>
{
  constructor(
    private postsSqlRepository: PostsSqlRepository,
    private likesSqlRepository: LikesSqlRepository,
  ) {}

  async execute(command: CreateLikeForPostCommand): Promise<InterlayerNotice> {
    //приводим к enum лайк
    const newStatusLike = command.likeStatusFromDto;
    // выносим переменные из команды в отедльные переменные
    const { userId, postId } = command;
    // const postId = command.postId;

    //ищем пост
    const foundPost = await this.postsSqlRepository.findById(postId);

    //возвращаем ошибку если пост не найден
    if (!foundPost) {
      const result = new InterlayerNotice(null);
      result.addError('Post is not exists', 'postId', 404);
      return result;
    }

    //ищем лайки для конкретных поста и пользователя
    const foundedLike = await this.likesSqlRepository.findLikeByUserAndPost(
      postId,
      userId,
    );

    //проверяем был ли создан лайк
    if (!foundedLike) {
      return await this.createNewLike(postId, userId, newStatusLike);
    }

    //установили новый статус лайка и обновили дату изменения лайка
    await this.likesSqlRepository.updateLikeForPost(
      foundedLike.id,
      newStatusLike,
    );
    return new InterlayerNotice();
  }

  async createNewLike(
    postId: string,
    userId: string,
    // userName: string,
    newStatusLike: likeStatus,
    // foundedPost: PostDocument,
  ): Promise<InterlayerNotice> {
    //если нет, то создаем новый лайк и сохраняем его
    await this.likesSqlRepository.createLikeForPost(
      postId,
      userId,
      newStatusLike,
    );

    return new InterlayerNotice();
  }
}
