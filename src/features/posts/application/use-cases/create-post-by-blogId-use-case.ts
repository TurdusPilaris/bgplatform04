import { CreatePostWithoutBlogIdInputModel } from '../../api/models/input/create-post-withoutBlogId.input.model';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';
import { InterlayerNotice } from '../../../../base/models/Interlayer';
import {
  PostOutputModel,
  PostOutputModelMapper,
} from '../../api/models/output/post.output.model';
import { PostCreateInputModel } from '../../api/models/input/create-post.input.model';

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
    private blogsQRepository: BlogsRepository,
  ) {}

  async execute(
    command: CreatePostByBlogIdCommand,
  ): Promise<InterlayerNotice<PostOutputModel | null>> {
    //we need to find blog
    const foundedBlog = await this.blogsQRepository.findById(command.blogId);

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
    const outputPostModel = PostOutputModelMapper(
      await this.postsRepository.createPost(dtoModel, foundedBlog.name),
    );

    return new InterlayerNotice(outputPostModel);
  }
}
