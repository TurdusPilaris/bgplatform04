import { CreatePostWithoutBlogIdInputModel } from '../../api/models/input/create-post-withoutBlogId.input.model';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { PostOutputModel } from '../../api/models/output/post.output.model';
import { PostCreateInputModel } from '../../api/models/input/create-post.input.model';
import { InterlayerNotice } from '../../../../../base/models/Interlayer';
import { PostsQueryRepository } from '../../infrastructure/posts.query-repository';
import { BlogsSqlRepository } from '../../../blogs/infrastructure/blogs.sql.repository';

export class CreatePostByBlogIdCommand {
  constructor(
    public inputModel: CreatePostWithoutBlogIdInputModel,
    public blogId: string,
  ) {}
}

@CommandHandler(CreatePostByBlogIdCommand)
export class CreatePostByBlogIdUseCase
  implements ICommandHandler<CreatePostByBlogIdCommand>
{
  constructor(
    private postsRepository: PostsRepository,
    private postsQueryRepository: PostsQueryRepository,
    private blogsSqlRepository: BlogsSqlRepository,
  ) {}

  async execute(
    command: CreatePostByBlogIdCommand,
  ): Promise<InterlayerNotice<PostOutputModel | null>> {
    //we need to find blog
    const foundedBlog = await this.blogsSqlRepository.findById(command.blogId);

    if (!foundedBlog) {
      const result = new InterlayerNotice(null);
      result.addError('Blog is not exists', 'blogId', 404);
      return result;
    }

    //crete dto model for regular create
    const dtoModel = new PostCreateInputModel();
    dtoModel.blogId = command.blogId;
    dtoModel.content = command.inputModel.content;
    dtoModel.title = command.inputModel.title;
    dtoModel.shortDescription = command.inputModel.shortDescription;

    //and finally map model
    const outputPostModel = this.postsQueryRepository.postOutputModelMapper(
      await this.postsRepository.createPost(dtoModel, foundedBlog.name),
    );

    return new InterlayerNotice(outputPostModel);
  }
}
