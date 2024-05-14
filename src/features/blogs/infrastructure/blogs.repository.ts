import { Injectable } from '@nestjs/common';
import { BlogCreateInputModel } from '../api/models/input/create-blog.input.model';
import {
  Blog,
  BlogDocument,
  BlogModelType,
} from '../domain/entiities/blog.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Injectable()
export class BlogsRepository {
  constructor(
    @InjectModel(Blog.name)
    private BlogModel: BlogModelType,
  ) {}

  async createBlog(inputModel: BlogCreateInputModel): Promise<BlogDocument> {
    const newBlog = this.BlogModel.createNewBlog(inputModel, this.BlogModel);
    return newBlog.save();
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
