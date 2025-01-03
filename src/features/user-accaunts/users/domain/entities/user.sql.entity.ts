import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { SessionSQL } from '../../../security/domain/session.sql';
import { CommentSQL } from '../../../../bloggers-platform/comments/domain/entities/comment.sql.entity';
import { LikeForPostSQL } from '../../../../bloggers-platform/likes/domain/entities/tor/likeForPost';
import { LikeForCommentSQL } from '../../../../bloggers-platform/likes/domain/entities/tor/likeForComment';
import { Player } from '../../../../quizeGame/domain/entities/player.entity';

@Entity({ name: 'user_tor' })
export class UserSQL {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userName: string;

  @Column()
  email: string;

  @Column()
  passwordHash: string;

  @Column()
  createdAt: Date;

  @Column()
  confirmationCode: string;

  @Column()
  expirationDate: Date;

  @Column({ default: false })
  isConfirmed: boolean;

  @OneToMany(() => SessionSQL, (s) => s.user)
  sessions: SessionSQL[];

  @OneToMany(() => CommentSQL, (c) => c.user)
  comments: CommentSQL[];

  @OneToMany(() => LikeForPostSQL, (l) => l.user)
  likesForPosts: LikeForPostSQL[];

  @OneToMany(() => LikeForCommentSQL, (l) => l.user)
  likesForComments: LikeForCommentSQL[];

  @OneToMany(() => Player, (p) => p.user)
  players: Player[];
}
