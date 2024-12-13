import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InterlayerNotice } from '../../../../../base/models/Interlayer';
import { PostsTorRepository } from '../../infrastructure/tor/posts.tor.repository';

export class DeletePostCommand {
  constructor(public postId: string) {}
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase implements ICommandHandler<DeletePostCommand> {
  constructor(private postsTorRepository: PostsTorRepository) {}

  async execute(command: DeletePostCommand): Promise<InterlayerNotice> {
    // if post wasn't found we will return an error
    const foundedPost = await this.postsTorRepository.findById(command.postId);
    if (!foundedPost) {
      const result = new InterlayerNotice(null);
      result.addError('Post is not exists', 'postId', 404);
      return result;
    }

    //delete post
    await this.postsTorRepository.delete(command.postId);

    //return information about success
    return new InterlayerNotice(null);
  }
}
