import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { likeStatus } from '../../../../../base/models/likesStatus';
import { BlogSQL } from '../../../blogs/domain/entiities/blog.sql.entity';

@Entity({ name: 'posts' })
export class PostSQL {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => BlogSQL, (p) => p.posts)
  blog: BlogSQL;

  @Column()
  blogId: string;

  @Column()
  blogName: string;

  @Column()
  title: string;

  @Column()
  shortDescription: string;

  @Column()
  content: string;

  @Column()
  createdAt: Date;

  @Column()
  dislikesCount: number;

  @Column()
  likesCount: number;

  @Column()
  myStatus: likeStatus;
}
