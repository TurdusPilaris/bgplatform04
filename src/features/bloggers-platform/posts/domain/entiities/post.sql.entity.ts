import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { likeStatus } from '../../../../../base/models/likesStatus';
import { BlogSQL } from '../../../blogs/domain/entiities/blog.sql.entity';
import { CommentSQL } from '../../../comments/domain/entities/comment.sql.entity';

@Entity({ name: 'posts' })
export class PostSQL {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => BlogSQL, (p) => p.posts)
  blog: BlogSQL;

  @Column()
  title: string;

  @Column()
  shortDescription: string;

  @Column()
  content: string;

  @Column()
  createdAt: Date;

  @OneToMany(() => CommentSQL, (c) => c.post)
  comments: CommentSQL[];
  static create(
    blogId: string,
    title: string,
    content: string,
    shortDescription: string,
    createdAt: Date = new Date(),
  ): PostSQL {
    const post = new PostSQL();
    post.blog = { id: blogId } as BlogSQL;
    (post.title = title), (post.content = content);
    post.shortDescription = shortDescription;
    post.createdAt = createdAt;
    return post;
  }
}
