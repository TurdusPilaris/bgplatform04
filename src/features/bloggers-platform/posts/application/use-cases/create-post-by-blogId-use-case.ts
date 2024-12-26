import { CreatePostWithoutBlogIdInputModel } from '../../api/models/input/create-post-withoutBlogId.input.model';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InterlayerNotice } from '../../../../../base/models/Interlayer';
import { BlogsSqlRepository } from '../../../blogs/infrastructure/sql/blogs.sql.repository';
import { PostsSqlRepository } from '../../infrastructure/sql/posts.sql.repository';
import { PostsSqlQueryRepository } from '../../infrastructure/sql/posts.sql.query-repository';
import { PostsTorRepository } from '../../infrastructure/tor/posts.tor.repository';
import { PostsTorQueryRepository } from '../../infrastructure/tor/posts.tor.query-repository';
import { PostSQL } from '../../domain/entiities/post.sql.entity';
import { BlogsTorRepository } from '../../../blogs/infrastructure/tor/blogs.tor.repository';

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
    private postsSqlRepository: PostsSqlRepository,
    private postsTorRepository: PostsTorRepository,
    private postsSqlQueryRepository: PostsSqlQueryRepository,
    private postsTorQueryRepository: PostsTorQueryRepository,
    private blogsSqlRepository: BlogsSqlRepository,
    private blogsTorRepository: BlogsTorRepository,
  ) {}

  async execute(command: CreatePostByBlogIdCommand) {
    // : Promise<InterlayerNotice<PostOutputModel | null>>
    //we need to find blog
    const foundedBlog = await this.blogsTorRepository.findById(command.blogId);

    if (!foundedBlog) {
      const result = new InterlayerNotice(null);
      result.addError('Blog is not exists', 'blogId', 404);
      return result;
    }

    const newPost = PostSQL.create(
      command.blogId,
      command.inputModel.title,
      command.inputModel.content,
      command.inputModel.shortDescription,
    );
    // //crete dto model for regular create
    // const dtoModel = new PostCreateInputModel();
    // dtoModel.blogId = command.blogId;
    // dtoModel.content = command.inputModel.content;
    // dtoModel.title = command.inputModel.title;
    // dtoModel.shortDescription = command.inputModel.shortDescription;
    //
    // const newPostId = await this.postsSqlRepository.createPost(dtoModel);

    const newPostId = await this.postsTorRepository.createPost(newPost);
    const createdPost = await this.postsSqlQueryRepository.findById(newPostId);

    return new InterlayerNotice(createdPost);
  }
}
