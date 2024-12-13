import {
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { QueryBlogInputModel } from './models/input/query-blog.model';
import { QueryPostInputModel } from '../../posts/api/models/input/query-post.model';
import { Request } from 'express';
import { BlogsSqlQueryRepository } from '../infrastructure/sql/blogs.sql.query-repository';
import { PostsSqlQueryRepository } from '../../posts/infrastructure/sql/posts.sql.query-repository';
import { GetOptionalUserGard } from '../../../../infrastructure/guards/get-optional-user-gard.service';
import { BlogsTorQueryRepository } from '../infrastructure/tor/blogs.tor.query-repository';
import { PostsTorQueryRepository } from '../../posts/infrastructure/tor/posts.tor.query-repository';

@Controller('blogs')
export class BlogsController {
  constructor(
    protected blogsSqlQueryRepository: BlogsSqlQueryRepository,
    protected blogsTorQueryRepository: BlogsTorQueryRepository,
    protected postsSqlQueryRepository: PostsSqlQueryRepository,
    protected postsTorQueryRepository: PostsTorQueryRepository,
  ) {}

  @Get()
  async getBlogs(
    @Query()
    queryDto: QueryBlogInputModel,
  ) {
    return await this.blogsTorQueryRepository.findAll(queryDto);
  }

  @Get(':id')
  async getBlog(@Param('id', new ParseUUIDPipe()) blogId: string) {
    const foundedBlog = await this.blogsTorQueryRepository.findById(blogId);
    if (!foundedBlog) {
      throw new NotFoundException();
    }
    return foundedBlog;
  }

  @UseGuards(GetOptionalUserGard)
  @Get(':id/posts')
  async getPostsByBlogId(
    @Query()
    queryDto: QueryPostInputModel,
    @Param('id', new ParseUUIDPipe()) blogId: string,
    @Req() req: Request,
  ) {
    const foundedBlog = await this.blogsTorQueryRepository.findById(blogId);
    if (!foundedBlog) {
      throw new NotFoundException();
    }
    return await this.postsTorQueryRepository.findAll(
      queryDto,
      req.userId,
      blogId,
    );
  }
}
