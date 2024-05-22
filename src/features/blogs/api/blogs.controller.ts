import {
  BadGatewayException,
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  NotFoundException,
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
    // @Query('pageSize', new DefaultValuePipe(10)) pageSize: number,
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
    // @Res() response: Response,
  ) {
    inputModel.blogId = blogId;
    const result = await this.postsService.create(inputModel);

    if (result.hasError()) {
      if (result.code === 404) {
        throw new NotFoundException();
      }
    }
    return result.data;
  }

  @Get(':id')
  async getBlog(@Param('id') blogId: string) {
    const foundedBlog = await this.blogsQueryRepository.findById(blogId);
    if (!foundedBlog) {
      throw new NotFoundException();
    }
    return foundedBlog;
  }

  @Get(':id/posts')
  async getPostsByBlogId(
    @Query(new ValidationPipe({ transform: true }))
    queryDto: QueryPostInputModel,
    @Param('id') blogId: string,
  ) {
    const foundedBlog = await this.blogsQueryRepository.findById(blogId);
    if (!foundedBlog) {
      throw new NotFoundException();
    }
    return await this.postsQueryRepository.findAll(queryDto, blogId);
  }
  @Put(':id')
  async updateBlog(
    @Param('id') blogId: string,
    @Body() inputModel: BlogCreateInputModel,
  ) {
    const result = await this.blogsService.updateBlog(blogId, inputModel);

    if (result.hasError()) {
      if (result.code === 404) {
        throw new NotFoundException();
      }
    }
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteBlog(
    @Param('id') blogId: string,
    //@Res({passthrough: true}) response: Response
  ) {
    const result = await this.blogsService.deleteBlog(blogId);
    if (result.hasError()) {
      if (result.code === 404) {
        throw new NotFoundException();
      }
    }
    return;
  }
}
