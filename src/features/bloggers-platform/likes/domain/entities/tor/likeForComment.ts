import { Column, Entity, ManyToOne } from 'typeorm';
import { likeStatus } from '../../../../../../base/models/likesStatus';
import { BaseDBEntity } from '../../../../../../base/domain/entities/baseDBEntity';
import { CommentSQL } from '../../../../comments/domain/entities/comment.sql.entity';

@Entity({ name: 'likeForComments' })
export class LikeForCommentSQL extends BaseDBEntity {
  @Column()
  login: string;

  @Column()
  statusLike: likeStatus;

  @ManyToOne(() => CommentSQL, (c) => c.likes)
  comment: CommentSQL;
}
