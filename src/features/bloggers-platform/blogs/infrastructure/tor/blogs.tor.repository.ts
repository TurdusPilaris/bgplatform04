import { Injectable } from '@nestjs/common';
import { BlogCreateInputModel } from '../../api/models/input/create-blog.input.model';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { BlogSQL } from '../../domain/entiities/blog.sql.entity';

@Injectable()
export class BlogsTorRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectRepository(BlogSQL)
    private readonly blogsRepository: Repository<BlogSQL>,
  ) {}

  async createBlog(blog: BlogSQL): Promise<string> {
    const createdBlog = await this.blogsRepository.save(blog);
    return createdBlog.id;
  }

  async findById(id: string): Promise<BlogSQL | null> {
    const foundBlog = await this.blogsRepository.findOneBy({ id: id });
    if (!foundBlog) return null;
    return foundBlog;
  }

  async delete(blogId: string) {
    await this.blogsRepository.delete(blogId);
  }

  async updateBlog(inputModel: BlogCreateInputModel, blogId: string) {
    await this.blogsRepository.update(
      { id: blogId },
      {
        name: inputModel.name,
        description: inputModel.description,
        websiteUrl: inputModel.websiteUrl,
      },
    );
  }
}
