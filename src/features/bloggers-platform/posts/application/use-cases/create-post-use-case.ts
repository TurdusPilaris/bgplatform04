import { PostCreateInputModel } from '../../api/models/input/create-post.input.model';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostOutputModel } from '../../api/models/output/post.output.model';
import { InterlayerNotice } from '../../../../../base/models/Interlayer';
import { BlogsSqlRepository } from '../../../blogs/infrastructure/sql/blogs.sql.repository';
import { PostsSqlRepository } from '../../infrastructure/sql/posts.sql.repository';
import { PostsSqlQueryRepository } from '../../infrastructure/sql/posts.sql.query-repository';

export class CreatePostCommand {
  constructor(public inputModel: PostCreateInputModel) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
  constructor(
    private postsSqlRepository: PostsSqlRepository,
    private postsSqlQueryRepository: PostsSqlQueryRepository,
    private blogsSqlRepository: BlogsSqlRepository,
  ) {}

  async execute(
    command: CreatePostCommand,
  ): Promise<InterlayerNotice<PostOutputModel | null>> {
    const foundedBlog = await this.blogsSqlRepository.findById(
      command.inputModel.blogId,
    );

    if (!foundedBlog) {
      const result = new InterlayerNotice(null);
      result.addError('Blog is not exists', 'blogId', 404);
      return result;
    }

    const newPostId = await this.postsSqlRepository.createPost(
      command.inputModel,
    );

    const createdPost = await this.postsSqlQueryRepository.findById(newPostId);

    return new InterlayerNotice(createdPost);
  }
}
