import { BlogCreateInputModel } from '../../api/models/input/create-blog.input.model';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InterlayerNotice } from '../../../../../base/models/Interlayer';
import { BlogsSqlRepository } from '../../infrastructure/sql/blogs.sql.repository';
import { BlogsTorRepository } from '../../infrastructure/tor/blogs.tor.repository';

export class UpdateBlogCommand {
  constructor(
    public inputModel: BlogCreateInputModel,
    public blogId: string,
  ) {}
}
@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase implements ICommandHandler<UpdateBlogCommand> {
  constructor(
    private blogsSqlRepository: BlogsSqlRepository,
    private blogsTorRepository: BlogsTorRepository,
  ) {}

  async execute(command: UpdateBlogCommand): Promise<InterlayerNotice> {
    // If the blog is not found, an error will be returned.
    const foundBlog = await this.blogsTorRepository.findById(command.blogId);

    if (!foundBlog) {
      const result = new InterlayerNotice(null);
      result.addError('Blog does not exists', 'blogId', 404);
      return result;
    }

    await this.blogsTorRepository.updateBlog(
      command.inputModel,
      command.blogId,
    );
    // //update blog
    // foundBlog.name = command.inputModel.name;
    // foundBlog.description = command.inputModel.description;
    // foundBlog.websiteUrl = command.inputModel.websiteUrl;
    //
    // //save blog
    // await this.blogsRepository.save(foundBlog);

    return new InterlayerNotice(null);
  }
}
