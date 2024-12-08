import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentOutputModel } from '../../api/model/output/comment.output.model';
import { InterlayerNotice } from '../../../../../base/models/Interlayer';
import { CommentsSqlRepository } from '../../infrastructure/comments.sql.repository';
import { PostsSqlRepository } from '../../../posts/infrastructure/sql/posts.sql.repository';
import { CommentsSqlQueryRepository } from '../../infrastructure/comments.sql.query-repository';

export class CreateCommentCommand {
  constructor(
    public comment: string,
    public postId: string,
    public userId: string,
  ) {}
}

@CommandHandler(CreateCommentCommand)
export class CreateCommentUseCase
  implements ICommandHandler<CreateCommentCommand>
{
  constructor(
    private postsSqlRepository: PostsSqlRepository,
    private commentsSqlRepository: CommentsSqlRepository,
    private commentsSqlQueryRepository: CommentsSqlQueryRepository,
  ) {}

  async execute(
    command: CreateCommentCommand,
  ): Promise<InterlayerNotice<CommentOutputModel | null>> {
    const foundedPost = await this.postsSqlRepository.findById(command.postId);
    if (!foundedPost) {
      const result = new InterlayerNotice(null);
      result.addError('Post is not exists', 'postId', 404);
      return result;
    }

    const newCommentId = await this.commentsSqlRepository.createComment(
      command.comment,
      command.postId,
      command.userId,
    );

    return new InterlayerNotice(
      await this.commentsSqlQueryRepository.findCommentById(
        newCommentId,
        command.userId,
      ),
    );
  }
}
