import { Injectable, Post } from '@nestjs/common';
import {
  PostClass,
  PostDocument,
  PostModelType,
} from '../domain/entiities/post.entity';
import { PostCreateInputModel } from '../api/models/input/create-post.input.model';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { DataSource } from 'typeorm';
import { BlogSQL } from '../../blogs/api/models/sql/blog.model.sql';
import { PostSQL } from '../api/models/sql/post.sql.model';
import { CreatePostWithoutBlogIdInputModel } from '../api/models/input/create-post-withoutBlogId.input.model';

@Injectable()
export class PostsSqlRepository {
  constructor(
    @InjectModel(PostClass.name)
    private PostModel: PostModelType,
    protected dataSource: DataSource,
  ) {}
  async createPost(createModel: PostCreateInputModel): Promise<string> {
    const query = `
    INSERT INTO public."Posts"(
        "blogId", title, "shortDescription", content, "createdAt")
        VALUES ( $1, $2, $3, $4, $5) RETURNING id;
    `;

    const res = await this.dataSource.query(query, [
      createModel.blogId,
      createModel.title,
      createModel.shortDescription,
      createModel.content,
      new Date(),
    ]);

    return res[0].id;
  }

  async update(updateModel: PostCreateInputModel, postId: string) {
    const query = `
    UPDATE public."Posts"
        SET title=$2, "shortDescription"=$3, content=$4
        WHERE id = $1;
    `;

    await this.dataSource.query(query, [
      postId,
      updateModel.title,
      updateModel.shortDescription,
      updateModel.content,
    ]);
  }
  async save(post: PostDocument) {
    return post.save();
  }

  async findById(id: string): Promise<PostSQL | null> {
    const query = `
    SELECT id, "blogId", title, "shortDescription", content, "createdAt"
        FROM public."Posts"
        WHERE id = $1;
    `;

    const foundPosts: PostSQL[] = await this.dataSource.query(query, [id]);

    if (foundPosts.length === 0) return null;

    return foundPosts[0];
  }

  async delete(postId: string) {
    const query = `
    DELETE FROM public."Posts"
        WHERE id = $1;
    `;

    await this.dataSource.query(query, [postId]);
  }
}
