import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PostSQL } from '../../../posts/domain/entiities/post.sql.entity';
import { UserSQL } from '../../../../user-accaunts/users/domain/entities/user.sql.entity';
import { LikeForCommentSQL } from '../../../likes/domain/entities/tor/likeForComment';
import { BaseDBEntity } from '../../../../../base/domain/entities/baseDBEntity';

@Entity({ name: 'comments' })
export class CommentSQL extends BaseDBEntity {
  @Column()
  content: string;

  @ManyToOne(() => PostSQL, (p) => p.comments)
  post: PostSQL;

  @ManyToOne(() => UserSQL, (u) => u.comments)
  user: UserSQL;

  @OneToMany(() => LikeForCommentSQL, (l) => l.comment)
  likes: LikeForCommentSQL[];

  static create(content: string, postId: string, userId: string): CommentSQL {
    const comment = new CommentSQL();
    comment.content = content;
    comment.user = { id: userId } as UserSQL;
    comment.post = { id: postId } as PostSQL;

    return comment;
  }
}
