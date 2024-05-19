import { Injectable } from '@nestjs/common';
import { BlogsRepository } from '../infrastructure/blogs.repository';
import { BlogCreateInputModel } from '../api/models/input/create-blog.input.model';
import { BlogOutputModelMapper } from '../api/models/output/blog.output.model';
import { InterlayerNotice } from '../../../base/models/Interlayer';

@Injectable()
export class BlogsService {
  constructor(private blogsRepository: BlogsRepository) {}

  async create(inputModel: BlogCreateInputModel) {
    return BlogOutputModelMapper(
      await this.blogsRepository.createBlog(inputModel),
    );
  }

  async updateBlog(
    blogId: string,
    inputModel: BlogCreateInputModel,
  ): Promise<InterlayerNotice> {
    // if blog wasn't found we will return an error
    const foundedBlog = await this.blogsRepository.findById(blogId);
    if (!foundedBlog) {
      const result = new InterlayerNotice(null);
      result.addError('Blog is not exists', 'blogId', 404);
      return result;
    }

    //update blog
    foundedBlog.name = inputModel.name;
    foundedBlog.description = inputModel.description;
    foundedBlog.websiteUrl = inputModel.websiteUrl;
    const resultUpdatedBlog = await this.blogsRepository.save(foundedBlog);

    return new InterlayerNotice(null);
  }

  async deleteBlog(blogId: string): Promise<InterlayerNotice> {
    // if blog wasn't found we will return an error
    const foundedBlog = await this.blogsRepository.findById(blogId);
    if (!foundedBlog) {
      const result = new InterlayerNotice(null);
      result.addError('Blog is not exists', 'blogId', 404);
      return result;
    }

    //delete blog
    const deletedBlog = await this.blogsRepository.delete(blogId);

    //Failed to create blog
    if (deletedBlog.deletedCount !== 1) {
      const result = new InterlayerNotice(null);
      result.addError('Failed to create blog', 'blogId', 404);
      return result;
    }

    //return information about success
    return new InterlayerNotice(null);
  }
}
