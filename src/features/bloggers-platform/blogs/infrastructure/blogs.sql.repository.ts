import { Injectable } from '@nestjs/common';
import { BlogCreateInputModel } from '../api/models/input/create-blog.input.model';
import {
  Blog,
  BlogDocument,
  BlogModelType,
} from '../domain/entiities/blog.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class BlogsSqlRepository {
  constructor(
    @InjectModel(Blog.name)
    private BlogModel: BlogModelType,
    @InjectDataSource() protected dataSource: DataSource,
  ) {}

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

  async findById(id: string): Promise<BlogDocument | null> {
    const blog = await this.BlogModel.findById(id, { __v: false });
    if (!blog) return null;
    return blog;
  }

  async save(foundedBlog: BlogDocument) {
    return foundedBlog.save();
  }

  async delete(blogId: string) {
    return this.BlogModel.deleteOne({
      _id: new Types.ObjectId(blogId),
    });
  }
}
