import { PostCreateInputModel } from '../../api/models/input/create-post.input.model';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../infrastructure/posts.repository';

import {
  PostOutputModel,
  postOutputModelMapper,
} from '../../api/models/output/post.output.model';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';
import { InterlayerNotice } from '../../../../../base/models/Interlayer';

export class CreatePostCommand {
  constructor(public inputModel: PostCreateInputModel) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
  constructor(
    private postsRepository: PostsRepository,
    private blogsRepository: BlogsRepository,
  ) {}

  async execute(
    command: CreatePostCommand,
  ): Promise<InterlayerNotice<PostOutputModel | null>> {
    const foundedBlog = await this.blogsRepository.findById(
      command.inputModel.blogId,
    );

    if (!foundedBlog) {
      const result = new InterlayerNotice(null);
      result.addError('Blog is not exists', 'blogId', 404);
      return result;
    }

    const outputPostModel = postOutputModelMapper(
      await this.postsRepository.createPost(
        command.inputModel,
        foundedBlog.name,
      ),
    );

    return new InterlayerNotice(outputPostModel);
  }
}
