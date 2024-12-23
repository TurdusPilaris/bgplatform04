import { Column, Entity, ManyToOne } from 'typeorm';
import { PostSQL } from '../../../../posts/domain/entiities/post.sql.entity';
import { likeStatus } from '../../../../../../base/models/likesStatus';
import { BaseDBEntity } from '../../../../../../base/domain/entities/baseDBEntity';

@Entity({ name: 'likeForPosts' })
export class LikeForPostSQL extends BaseDBEntity {
  @Column()
  login: string;

  @Column()
  statusLike: likeStatus;

  @ManyToOne(() => PostSQL, (p) => p.likes)
  post: PostSQL;
}
