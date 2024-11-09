import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { BlogCreateInputModel } from '../../api/models/input/create-blog.input.model';
import { BlogOutputModel } from '../../api/models/output/blog.output.model';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsSqlRepository } from '../../infrastructure/blogs.sql.repository';

export class CreateBlogCommand {
  constructor(public inputModel: BlogCreateInputModel) {}
}
@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<CreateBlogCommand> {
  constructor(private blogsSqlRepository: BlogsSqlRepository) {}

  async execute(command: CreateBlogCommand): Promise<string> {
    const createdBlodId = await this.blogsSqlRepository.createBlog(
      command.inputModel,
    );
    return createdBlodId;
  }
}
