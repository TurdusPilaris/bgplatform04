import { BlogsRepository } from '../../infrastructure/mongo/blogs.repository';
import { BlogCreateInputModel } from '../../api/models/input/create-blog.input.model';
import { BlogOutputModel } from '../../api/models/output/blog.output.model';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsSqlRepository } from '../../infrastructure/sql/blogs.sql.repository';
import { BlogSQL } from '../../domain/entiities/blog.sql.entity';
import { BlogsTorRepository } from '../../infrastructure/tor/blogs.tor.repository';

export class CreateBlogCommand {
  constructor(public inputModel: BlogCreateInputModel) {}
}
@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<CreateBlogCommand> {
  constructor(
    private blogsSqlRepository: BlogsSqlRepository,
    private blogsTorRepository: BlogsTorRepository,
  ) {}

  async execute(command: CreateBlogCommand): Promise<string> {
    const blogSQL = BlogSQL.create(
      command.inputModel.name,
      command.inputModel.description,
      command.inputModel.websiteUrl,
    );

    const createdBlodId = await this.blogsTorRepository.createBlog(blogSQL);
    // const createdBlodId = await this.blogsSqlRepository.createBlog(
    //   command.inputModel,
    // );
    return createdBlodId;
  }
}
