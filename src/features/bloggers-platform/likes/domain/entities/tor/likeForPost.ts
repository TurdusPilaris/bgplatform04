import { Column, Entity, ManyToOne } from 'typeorm';
import { PostSQL } from '../../../../posts/domain/entiities/post.sql.entity';
import { likeStatus } from '../../../../../../base/models/likesStatus';
import { BaseDBEntity } from '../../../../../../base/domain/entities/baseDBEntity';
import { UserSQL } from '../../../../../user-accaunts/users/domain/entities/user.sql.entity';

@Entity({ name: 'likeForPosts' })
export class LikeForPostSQL extends BaseDBEntity {
  @ManyToOne(() => UserSQL, (u) => u.likesForPosts)
  user: UserSQL;

  @Column()
  statusLike: likeStatus;

  @ManyToOne(() => PostSQL, (p) => p.likes)
  post: PostSQL;

  static create(
    postId: string,
    userId: string,
    statusLike: likeStatus,
  ): LikeForPostSQL {
    const like = new LikeForPostSQL();
    like.user = { id: userId } as UserSQL;
    like.post = { id: postId } as PostSQL;
    like.statusLike = statusLike;
    return like;
  }
}
