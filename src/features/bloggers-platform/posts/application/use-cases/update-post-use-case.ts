import { PostCreateInputModel } from '../../api/models/input/create-post.input.model';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InterlayerNotice } from '../../../../../base/models/Interlayer';
import { BlogsSqlRepository } from '../../../blogs/infrastructure/blogs.sql.repository';
import { PostsSqlRepository } from '../../infrastructure/posts.sql.repository';

export class UpdatePostCommand {
  constructor(
    public inputModel: PostCreateInputModel,
    public postId: string,
  ) {}
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase implements ICommandHandler<UpdatePostCommand> {
  constructor(
    private postsSqlRepository: PostsSqlRepository,
    private blogsSqlRepository: BlogsSqlRepository,
  ) {}

  async execute(command: UpdatePostCommand): Promise<InterlayerNotice> {
    const foundedBlog = await this.blogsSqlRepository.findById(
      command.inputModel.blogId,
    );

    if (!foundedBlog) {
      const result = new InterlayerNotice(null);
      result.addError('Blog is not exists', 'blogId', 404);
      return result;
    }

    const foundedPost = await this.postsSqlRepository.findById(command.postId);

    if (!foundedPost) {
      const result = new InterlayerNotice(null);
      result.addError('Post is not exists', 'postId', 404);
      return result;
    }

    await this.postsSqlRepository.update(command.inputModel, command.postId);

    return new InterlayerNotice(null);
  }
}
