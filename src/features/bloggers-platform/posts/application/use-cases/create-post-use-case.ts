import { PostCreateInputModel } from '../../api/models/input/create-post.input.model';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { PostOutputModel } from '../../api/models/output/post.output.model';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';
import { InterlayerNotice } from '../../../../../base/models/Interlayer';
import { PostsQueryRepository } from '../../infrastructure/posts.query-repository';
import { BlogsSqlRepository } from '../../../blogs/infrastructure/blogs.sql.repository';
import { PostsSqlRepository } from '../../infrastructure/posts.sql.repository';
import { PostsSqlQueryRepository } from '../../infrastructure/posts.sql.query-repository';

export class CreatePostCommand {
  constructor(public inputModel: PostCreateInputModel) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
  constructor(
    private postsRepository: PostsRepository,
    private postsSqlRepository: PostsSqlRepository,
    private postsQueryRepository: PostsQueryRepository,
    private postsSqlQueryRepository: PostsSqlQueryRepository,
    private blogsRepository: BlogsRepository,
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

    // const outputPostModel = this.postsQueryRepository.postOutputModelMapper(
    //   await this.postsSqlRepository.createPost(
    //     command.inputModel,
    //     // foundedBlog.name,
    //   ),
    // );

    return new InterlayerNotice(createdPost);
  }
}
