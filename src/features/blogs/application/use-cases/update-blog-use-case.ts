import { BlogCreateInputModel } from '../../api/models/input/create-blog.input.model';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { InterlayerNotice } from '../../../../base/models/Interlayer';

export class UpdateBlogCommand {
  constructor(
    public inputModel: BlogCreateInputModel,
    public blogId: string,
  ) {}
}
@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase implements ICommandHandler<UpdateBlogCommand> {
  constructor(private blogsRepository: BlogsRepository) {}

  async execute(command: UpdateBlogCommand): Promise<InterlayerNotice> {
    // if blog wasn't found we will return an error
    const foundedBlog = await this.blogsRepository.findById(command.blogId);
    if (!foundedBlog) {
      const result = new InterlayerNotice(null);
      result.addError('Blog is not exists', 'blogId', 404);
      return result;
    }

    //update blog
    foundedBlog.name = command.inputModel.name;
    foundedBlog.description = command.inputModel.description;
    foundedBlog.websiteUrl = command.inputModel.websiteUrl;

    //save blog
    await this.blogsRepository.save(foundedBlog);

    return new InterlayerNotice(null);
  }
}
