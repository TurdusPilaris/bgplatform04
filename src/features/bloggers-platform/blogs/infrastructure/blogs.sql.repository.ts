import { Injectable } from '@nestjs/common';
import { BlogCreateInputModel } from '../api/models/input/create-blog.input.model';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BlogSQL } from '../api/models/sql/blog.model.sql';

@Injectable()
export class BlogsSqlRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async createBlog(createModel: BlogCreateInputModel): Promise<string> {
    const query = `
    INSERT INTO public."Blogs"(
        name, description, "websiteUrl", "createdAt", "isMembership")
        VALUES ( $1, $2, $3, $4, $5) RETURNING id;
    `;

    const res = await this.dataSource.query(query, [
      createModel.name,
      createModel.description,
      createModel.websiteUrl,
      new Date(),
      false,
    ]);

    return res[0].id;
  }

  async findById(id: string): Promise<BlogSQL | null> {
    const query = `
    SELECT id, name, description, "websiteUrl", "createdAt", "isMembership"
        FROM public."Blogs"
        WHERE id = $1;
    `;

    const foundBlogs: BlogSQL[] = await this.dataSource.query(query, [id]);

    if (foundBlogs.length === 0) return null;

    return foundBlogs[0];
  }

  async delete(blogId: string) {
    const query = `
    DELETE FROM public."Blogs"
        WHERE id = $1;
    `;

    await this.dataSource.query(query, [blogId]);
  }

  async updateBlog(inputModel: BlogCreateInputModel, blogId: string) {
    const query = `
    UPDATE public."Blogs"
        SET  name=$2, description=$3, "websiteUrl"=$4
        WHERE id = $1;
    `;

    await this.dataSource.query(query, [
      blogId,
      inputModel.name,
      inputModel.description,
      inputModel.websiteUrl,
    ]);
  }
}
