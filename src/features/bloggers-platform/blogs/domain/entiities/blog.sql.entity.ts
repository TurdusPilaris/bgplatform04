import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { PostSQL } from '../../../posts/domain/entiities/post.sql.entity';

@Entity({ name: 'blogs' })
export class BlogSQL {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  websiteUrl: string;

  @Column()
  createdAt: Date;

  @Column({ default: false })
  isMembership: boolean;

  @OneToMany(() => PostSQL, (p) => p.blog)
  posts: PostSQL[];
}
