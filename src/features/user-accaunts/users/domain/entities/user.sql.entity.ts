import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { SessionSQL } from '../../../security/domain/session.sql';
import { CommentSQL } from '../../../../bloggers-platform/comments/domain/entities/comment.sql.entity';

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
}
