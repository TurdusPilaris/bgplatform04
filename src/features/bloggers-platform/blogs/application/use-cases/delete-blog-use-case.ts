import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InterlayerNotice } from '../../../../../base/models/Interlayer';

export class DeleteBlogCommand {
  constructor(public blogId: string) {}
}
@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase implements ICommandHandler<DeleteBlogCommand> {
  constructor(private blogsRepository: BlogsRepository) {}

  async execute(command: DeleteBlogCommand): Promise<InterlayerNotice> {
    // if blog wasn't found we will return an error
    const foundedBlog = await this.blogsRepository.findById(command.blogId);
    if (!foundedBlog) {
      const result = new InterlayerNotice(null);
      result.addError('Blog is not exists', 'blogId', 404);
      return result;
    }

    //delete blog
    await this.blogsRepository.delete(command.blogId);

    //return information about success
    return new InterlayerNotice();
  }
}
