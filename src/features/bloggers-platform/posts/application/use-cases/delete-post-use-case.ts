import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InterlayerNotice } from '../../../../../base/models/Interlayer';
import { PostsSqlRepository } from '../../infrastructure/sql/posts.sql.repository';

export class DeletePostCommand {
  constructor(public postId: string) {}
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase implements ICommandHandler<DeletePostCommand> {
  constructor(private postsSqlRepository: PostsSqlRepository) {}

  async execute(command: DeletePostCommand): Promise<InterlayerNotice> {
    // if post wasn't found we will return an error
    const foundedPost = await this.postsSqlRepository.findById(command.postId);
    if (!foundedPost) {
      const result = new InterlayerNotice(null);
      result.addError('Post is not exists', 'postId', 404);
      return result;
    }

    //delete post
    await this.postsSqlRepository.delete(command.postId);

    //return information about success
    return new InterlayerNotice(null);
  }
}
