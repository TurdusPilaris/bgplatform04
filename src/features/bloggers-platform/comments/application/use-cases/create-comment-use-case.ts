import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentOutputModel } from '../../api/model/output/comment.output.model';
import { InterlayerNotice } from '../../../../../base/models/Interlayer';
import { CommentsSqlRepository } from '../../infrastructure/sql/comments.sql.repository';
import { PostsSqlRepository } from '../../../posts/infrastructure/sql/posts.sql.repository';
import { CommentsSqlQueryRepository } from '../../infrastructure/sql/comments.sql.query-repository';
import { CommentsTorRepository } from '../../infrastructure/tor/comments.tor.repository';
import { PostsTorRepository } from '../../../posts/infrastructure/tor/posts.tor.repository';
import { CommentSQL } from '../../domain/entities/comment.sql.entity';
import { CommentsTorQueryRepository } from '../../infrastructure/tor/comments.tor.query-repository';

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
    private postsTorRepository: PostsTorRepository,
    private commentsSqlRepository: CommentsSqlRepository,
    private commentsTorRepository: CommentsTorRepository,
    private commentsSqlQueryRepository: CommentsSqlQueryRepository,
    private commentsTorQueryRepository: CommentsTorQueryRepository,
  ) {}

  async execute(
    command: CreateCommentCommand,
  ): Promise<InterlayerNotice<CommentOutputModel | null>> {
    const foundedPost = await this.postsTorRepository.findById(command.postId);
    if (!foundedPost) {
      const result = new InterlayerNotice(null);
      result.addError('Post is not exists', 'postId', 404);
      return result;
    }

    const newComment = CommentSQL.create(
      command.comment,
      command.postId,
      command.userId,
    );
    const newCommentId =
      await this.commentsTorRepository.createComment(newComment);
    // const newCommentId = await this.commentsSqlRepository.createComment(
    //   command.comment,
    //   command.postId,
    //   command.userId,
    // );

    return new InterlayerNotice(
      await this.commentsTorQueryRepository.findCommentById(
        newCommentId,
        command.userId,
      ),
    );
  }
}
