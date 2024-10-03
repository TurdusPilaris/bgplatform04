import { Injectable, UseGuards } from '@nestjs/common';
import { BlogsRepository } from '../infrastructure/blogs.repository';
import { BlogCreateInputModel } from '../api/models/input/create-blog.input.model';
import { BlogOutputModelMapper } from '../api/models/output/blog.output.model';
import { InterlayerNotice } from '../../../base/models/Interlayer';
import { AuthBasicGuard } from '../../../infrastructure/guards/auth.basic.guard';

@Injectable()
export class BlogsService {
  constructor(private blogsRepository: BlogsRepository) {}

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
}
