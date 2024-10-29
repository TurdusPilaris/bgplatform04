import { PostCreateInputModel } from '../../api/models/input/create-post.input.model';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';
import { InterlayerNotice } from '../../../../../base/models/Interlayer';

export class UpdatePostCommand {
  constructor(
    public inputModel: PostCreateInputModel,
    public postId: string,
  ) {}
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase implements ICommandHandler<UpdatePostCommand> {
  constructor(
    private postsRepository: PostsRepository,
    private blogsRepository: BlogsRepository,
  ) {}

  async execute(command: UpdatePostCommand): Promise<InterlayerNotice<null>> {
    const foundedBlog = await this.blogsRepository.findById(
      command.inputModel.blogId,
    );

    if (!foundedBlog) {
      const result = new InterlayerNotice(null);
      result.addError('Blog is not exists', 'blogId', 404);
      return result;
    }

    const foundedPost = await this.postsRepository.findById(command.postId);

    if (!foundedPost) {
      const result = new InterlayerNotice(null);
      result.addError('Post is not exists', 'postId', 404);
      return result;
    }

    await this.postsRepository.update(
      foundedPost,
      command.inputModel,
      foundedBlog.name,
    );

    return new InterlayerNotice(null);
  }
}
