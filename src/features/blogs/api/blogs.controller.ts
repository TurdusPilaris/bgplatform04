import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Res,
  ValidationPipe,
} from '@nestjs/common';
import { BlogsQueryRepository } from '../infrastructure/blogs.query-repository';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogModelType } from '../domain/entiities/blog.entity';
import { BlogCreateInputModel } from './models/input/create-blog.input.model';
import { BlogsService } from '../application/blogs.service';
import { QueryBlogInputModel } from './models/input/query-blog.model';
import { Response } from 'express';

@Controller('blogs')
export class BlogsController {
  constructor(
    protected blogsService: BlogsService,
    protected blogsQueryRepository: BlogsQueryRepository,
    @InjectModel(Blog.name)
    private BlogModel: BlogModelType,
  ) {}

  @Get()
  async getBlogs(
    @Query(new ValidationPipe({ transform: true }))
    queryDto: QueryBlogInputModel,
  ) {
    return await this.blogsQueryRepository.findAll(queryDto);
  }

  @Post()
  async createBlog(@Body() inputModel: BlogCreateInputModel) {
    return await this.blogsService.create(inputModel);
  }

  @Get(':id')
  async getBlog(@Param('id') blogId: string) {
    return await this.blogsQueryRepository.findById(blogId);
  }

  @Put(':id')
  async updateUser(
    @Param('id') blogId: string,
    @Body() inputModel: BlogCreateInputModel,
    @Res() response: Response,
  ) {
    const result = await this.blogsService.updateBlog(blogId, inputModel);

    if (result.hasError()) {
      if (result.code === 404) {
        return response.status(result.code).send();
      }
    } else {
      return response.status(204).send();
    }
  }

  @Delete(':id')
  async deleteBlog(@Param('id') blogId: string, @Res() response: Response) {
    const result = await this.blogsService.deleteBlog(blogId);
    if (result.hasError()) {
      if (result.code === 404) {
        return response.status(result.code).send();
      }
      if (result.code === 502) {
        return response.status(result.code).send();
      }
    } else {
      return response.status(204).send();
    }
  }
}
