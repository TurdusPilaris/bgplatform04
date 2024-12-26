import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { BlogCreateInputModel } from './models/input/create-blog.input.model';
import { QueryBlogInputModel } from './models/input/query-blog.model';
import { QueryPostInputModel } from '../../posts/api/models/input/query-post.model';
import { DeleteBlogCommand } from '../application/use-cases/delete-blog-use-case';
import { CreateBlogCommand } from '../application/use-cases/create-blog-use-case';
import { CommandBus } from '@nestjs/cqrs';
import { CreatePostWithoutBlogIdInputModel } from '../../posts/api/models/input/create-post-withoutBlogId.input.model';
import { UpdateBlogCommand } from '../application/use-cases/update-blog-use-case';
import { CreatePostByBlogIdCommand } from '../../posts/application/use-cases/create-post-by-blogId-use-case';
import { AuthBasicGuard } from '../../../../infrastructure/guards/auth.basic.guard';
import { GetOptionalUserGard } from '../../../../infrastructure/guards/get-optional-user-gard.service';
import { ErrorProcessor } from '../../../../base/models/errorProcessor';
import { Request } from 'express';
import { BlogsSqlQueryRepository } from '../infrastructure/sql/blogs.sql.query-repository';
import { PostsSqlQueryRepository } from '../../posts/infrastructure/sql/posts.sql.query-repository';
import { DeletePostCommand } from '../../posts/application/use-cases/delete-post-use-case';
import { PostCreateInputModel } from '../../posts/api/models/input/create-post.input.model';
import { UpdatePostCommand } from '../../posts/application/use-cases/update-post-use-case';
import { BlogsTorQueryRepository } from '../infrastructure/tor/blogs.tor.query-repository';
import { PostsTorQueryRepository } from '../../posts/infrastructure/tor/posts.tor.query-repository';

@Controller('sa/blogs')
export class BlogsSaController {
  constructor(
    private commandBus: CommandBus,
    protected blogsSqlQueryRepository: BlogsSqlQueryRepository,
    protected blogsTorQueryRepository: BlogsTorQueryRepository,
    protected postsSqlQueryRepository: PostsSqlQueryRepository,
    protected postsTorQueryRepository: PostsTorQueryRepository,
  ) {}

  @Get()
  @UseGuards(AuthBasicGuard)
  async getBlogs(
    @Query()
    queryDto: QueryBlogInputModel,
  ) {
    return await this.blogsTorQueryRepository.findAll(queryDto);
  }

  @Get(':id')
  @UseGuards(AuthBasicGuard)
  async getBlog(@Param('id', new ParseUUIDPipe()) blogId: string) {
    const foundedBlog = await this.blogsTorQueryRepository.findById(blogId);
    if (!foundedBlog) {
      throw new NotFoundException();
    }
    return foundedBlog;
  }

  @UseGuards(GetOptionalUserGard)
  @Get(':id/posts')
  @UseGuards(AuthBasicGuard)
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
    return await this.postsSqlQueryRepository.findAll(
      queryDto,
      req.userId,
      blogId,
    );
  }

  @Post()
  @UseGuards(AuthBasicGuard)
  async createBlog(
    @Body()
    inputModel: BlogCreateInputModel,
  ) {
    const blogId = await this.commandBus.execute(
      new CreateBlogCommand(inputModel),
    );
    return await this.blogsTorQueryRepository.findById(blogId);
  }

  @HttpCode(201)
  @UseGuards(AuthBasicGuard)
  @Post(':id/posts')
  async createPostByBlogId(
    @Param('id', new ParseUUIDPipe()) blogId: string,
    @Body() inputModel: CreatePostWithoutBlogIdInputModel,
  ) {
    const result = await this.commandBus.execute(
      new CreatePostByBlogIdCommand(inputModel, blogId),
    );

    if (result.hasError()) {
      new ErrorProcessor(result).handleError();
    }
    return result.data;
  }

  @HttpCode(204)
  @Put(':id')
  @UseGuards(AuthBasicGuard)
  async updateBlog(
    @Param('id', new ParseUUIDPipe()) blogId: string,
    @Body() inputModel: BlogCreateInputModel,
  ) {
    const result = await this.commandBus.execute(
      new UpdateBlogCommand(inputModel, blogId),
    );

    if (result.hasError()) {
      new ErrorProcessor(result).handleError();
    }
  }

  @Delete(':id')
  @UseGuards(AuthBasicGuard)
  @HttpCode(204)
  async deleteBlog(@Param('id', new ParseUUIDPipe()) blogId: string) {
    const result = await this.commandBus.execute(new DeleteBlogCommand(blogId));
    if (result.hasError()) {
      new ErrorProcessor(result).handleError();
    }
    return;
  }

  @Delete(':id/posts/:postId')
  @UseGuards(AuthBasicGuard)
  @HttpCode(204)
  async deletePost(
    @Param('id', new ParseUUIDPipe()) blogId: string,
    @Param('postId', new ParseUUIDPipe()) postId: string,
  ) {
    const foundedBlog = await this.blogsTorQueryRepository.findById(blogId);
    if (!foundedBlog) {
      throw new NotFoundException();
    }
    const result = await this.commandBus.execute(new DeletePostCommand(postId));
    if (result.hasError()) {
      new ErrorProcessor(result).handleError();
    }
    return;
  }

  @Put(':id/posts/:postId')
  @UseGuards(AuthBasicGuard)
  @HttpCode(204)
  async putPost(
    @Param('id', new ParseUUIDPipe()) blogId: string,
    @Param('postId', new ParseUUIDPipe()) postId: string,
    @Body() inputModel: PostCreateInputModel,
  ) {
    const foundedBlog = await this.blogsTorQueryRepository.findById(blogId);
    if (!foundedBlog) {
      throw new NotFoundException();
    }

    inputModel.blogId = blogId;
    const result = await this.commandBus.execute(
      new UpdatePostCommand(inputModel, postId),
    );
    if (result.hasError()) {
      new ErrorProcessor(result).handleError();
    }
    return;
  }
}
