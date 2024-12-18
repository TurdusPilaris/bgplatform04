import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { PostSQL } from '../../../posts/domain/entiities/post.sql.entity';
import { UserSQL } from '../../../../user-accaunts/users/domain/entities/user.sql.entity';

@Entity({ name: 'comments' })
export class CommentSQL {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  content: string;

  @Column()
  createdAt: Date;

  @ManyToOne(() => PostSQL, (p) => p.comments)
  post: PostSQL;

  @ManyToOne(() => UserSQL, (u) => u.comments)
  user: UserSQL;
  static create(
    content: string,
    postId: string,
    userId: string,
    createdAt: Date = new Date(),
  ): CommentSQL {
    const comment = new CommentSQL();
    comment.content = content;
    comment.user = { id: userId } as UserSQL;
    comment.post = { id: postId } as PostSQL;
    comment.createdAt = createdAt;

    return comment;
  }
}
