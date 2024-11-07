import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentOutputModel } from '../../api/model/output/comment.output.model';
import { PostsRepository } from '../../../posts/infrastructure/posts.repository';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { UsersRepository } from '../../../../user-accaunts/users/infrastructure/users.repository';
import { InterlayerNotice } from '../../../../../base/models/Interlayer';
import { likeStatus } from '../../../../../base/models/likesStatus';
import { CommentsQueryRepository } from '../../infrastructure/comments.query-repository';
import { UsersSqlRepository } from '../../../../user-accaunts/users/infrastructure/users.sql.repositories';

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
    private postsRepository: PostsRepository,
    private usersRepository: UsersRepository,
    private usersSqlRepository: UsersSqlRepository,
    private commentsRepository: CommentsRepository,
    private commentsQueryRepository: CommentsQueryRepository,
  ) {}

  async execute(
    command: CreateCommentCommand,
  ): Promise<InterlayerNotice<CommentOutputModel | null>> {
    const foundedPost = await this.postsRepository.findById(command.postId);
    if (!foundedPost) {
      const result = new InterlayerNotice(null);
      result.addError('Post is not exists', 'postId', 404);
      return result;
    }

    const user = await this.usersSqlRepository.findById(command.userId);

    const newComment = await this.commentsRepository.createComment(
      command.comment,
      command.postId,
      user.id,
      user.accountData.userName,
    );

    return new InterlayerNotice(
      this.commentsQueryRepository.commentOutputModelMapper(
        newComment,
        likeStatus.None,
      ),
    );
  }
}
