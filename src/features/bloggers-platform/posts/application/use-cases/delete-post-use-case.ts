import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { InterlayerNotice } from '../../../../../base/models/Interlayer';
import { PostsSqlRepository } from '../../infrastructure/posts.sql.repository';

export class DeletePostCommand {
  constructor(public postId: string) {}
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase implements ICommandHandler<DeletePostCommand> {
  constructor(
    private postsRepository: PostsRepository,
    private postsSqlRepository: PostsSqlRepository,
  ) {}

  async execute(command: DeletePostCommand): Promise<InterlayerNotice<null>> {
    // if post wasn't found we will return an error
    const foundedPost = await this.postsSqlRepository.findById(command.postId);
    if (!foundedPost) {
      const result = new InterlayerNotice(null);
      result.addError('Post is not exists', 'postId', 404);
      return result;
    }

    console.log('Im here');
    //delete post
    await this.postsSqlRepository.delete(command.postId);

    //return information about success
    return new InterlayerNotice(null);
  }
}
