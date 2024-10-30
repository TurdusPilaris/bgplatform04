import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { BlogCreateInputModel } from '../../api/models/input/create-blog.input.model';
import { BlogOutputModel } from '../../api/models/output/blog.output.model';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class CreateBlogCommand {
  constructor(public inputModel: BlogCreateInputModel) {}
}
@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<CreateBlogCommand> {
  constructor(private blogsRepository: BlogsRepository) {}

  async execute(command: CreateBlogCommand): Promise<BlogOutputModel> {
    const createdBlod = await this.blogsRepository.createBlog(
      command.inputModel,
    );
    return createdBlod.id;
  }
}
