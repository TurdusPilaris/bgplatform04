import { Column, Entity, ManyToOne } from 'typeorm';
import { likeStatus } from '../../../../../../base/models/likesStatus';
import { BaseDBEntity } from '../../../../../../base/domain/entities/baseDBEntity';
import { CommentSQL } from '../../../../comments/domain/entities/comment.sql.entity';
import { UserSQL } from '../../../../../user-accaunts/users/domain/entities/user.sql.entity';

@Entity({ name: 'likeForComments' })
export class LikeForCommentSQL extends BaseDBEntity {
  @ManyToOne(() => UserSQL, (u) => u.likesForPosts)
  user: UserSQL;

  @Column()
  statusLike: likeStatus;

  @ManyToOne(() => CommentSQL, (c) => c.likes)
  comment: CommentSQL;

  static create(
    commentId: string,
    userId: string,
    statusLike: likeStatus,
  ): LikeForCommentSQL {
    const like = new LikeForCommentSQL();
    like.user = { id: userId } as UserSQL;
    like.comment = { id: commentId } as CommentSQL;
    like.statusLike = statusLike;
    return like;
  }
}
