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
    // if blog wasn't found we will return an error
    const foundedBlog = await this.blogsTorRepository.findById(command.blogId);
    console.log('foundedBlog', foundedBlog);
    if (!foundedBlog) {
      const result = new InterlayerNotice(null);
      result.addError('Blog is not exists', 'blogId', 404);
      return result;
    }

    await this.blogsTorRepository.updateBlog(
      command.inputModel,
      command.blogId,
    );
    // //update blog
    // foundedBlog.name = command.inputModel.name;
    // foundedBlog.description = command.inputModel.description;
    // foundedBlog.websiteUrl = command.inputModel.websiteUrl;
    //
    // //save blog
    // await this.blogsRepository.save(foundedBlog);

    return new InterlayerNotice(null);
  }
}
