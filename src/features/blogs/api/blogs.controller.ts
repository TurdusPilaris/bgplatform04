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
import { PostsService } from '../../posts/application/posts.service';
import { PostCreateInputModel } from '../../posts/api/models/input/create-post.input.model';
import { QueryPostInputModel } from '../../posts/api/models/input/query-post.model';
import { PostsQueryRepository } from '../../posts/infrastructure/posts.query-repository';

@Controller('blogs')
export class BlogsController {
  constructor(
    protected blogsService: BlogsService,
    protected postsService: PostsService,
    protected blogsQueryRepository: BlogsQueryRepository,
    protected postsQueryRepository: PostsQueryRepository,
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

  @Post(':id/posts')
  async createPostByBlogId(
    @Param('id') blogId: string,
    @Body() inputModel: PostCreateInputModel,
    @Res() response: Response,
  ) {
    inputModel.blogId = blogId;
    const result = await this.postsService.create(inputModel);

    if (result.hasError()) {
      if (result.code === 404) {
        return response.status(result.code).send();
      }
    } else {
      return response.status(201).send(result.data);
    }
  }

  @Get(':id')
  async getBlog(@Param('id') blogId: string, @Res() response: Response) {
    const foundedBlog = await this.blogsQueryRepository.findById(blogId);
    console.log('foundedBlog', foundedBlog);
    if (!foundedBlog) {
      return response.status(404).send();
    }
    return response.status(200).send(foundedBlog);
  }

  @Get(':id/posts')
  async getPostsByBlogId(
    @Query(new ValidationPipe({ transform: true }))
    queryDto: QueryPostInputModel,
    @Param('id') blogId: string,
  ) {
    return await this.postsQueryRepository.findAll(queryDto, blogId);
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
