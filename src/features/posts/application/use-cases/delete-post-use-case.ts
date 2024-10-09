import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { InterlayerNotice } from '../../../../base/models/Interlayer';

export class DeletePostCommand {
  constructor(public postId: string) {}
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase implements ICommandHandler<DeletePostCommand> {
  constructor(private postsRepository: PostsRepository) {}

  async execute(command: DeletePostCommand): Promise<InterlayerNotice<null>> {
    // if post wasn't found we will return an error
    const foundedPost = await this.postsRepository.findById(command.postId);
    if (!foundedPost) {
      const result = new InterlayerNotice(null);
      result.addError('Post is not exists', 'postId', 404);
      return result;
    }

    //delete post
    await this.postsRepository.delete(command.postId);

    //return information about success
    return new InterlayerNotice(null);
  }
}
