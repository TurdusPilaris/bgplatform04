import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { BlogsQueryRepository } from '../infrastructure/blogs.query-repository';
import { BlogCreateInputModel } from './models/input/create-blog.input.model';
import { QueryBlogInputModel } from './models/input/query-blog.model';
import { QueryPostInputModel } from '../../posts/api/models/input/query-post.model';
import { PostsQueryRepository } from '../../posts/infrastructure/posts.query-repository';
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

@Controller('blogs')
export class BlogsController {
  constructor(
    private commandBus: CommandBus,
    protected blogsQueryRepository: BlogsQueryRepository,
    protected postsQueryRepository: PostsQueryRepository,
  ) {}

  @Get()
  async getBlogs(
    @Query()
    queryDto: QueryBlogInputModel,
  ) {
    return await this.blogsQueryRepository.findAll(queryDto);
  }

  @Get(':id')
  async getBlog(@Param('id') blogId: string) {
    const foundedBlog = await this.blogsQueryRepository.findById(blogId);
    if (!foundedBlog) {
      throw new NotFoundException();
    }
    return foundedBlog;
  }

  @UseGuards(GetOptionalUserGard)
  @Get(':id/posts')
  async getPostsByBlogId(
    @Query(new ValidationPipe({ transform: true }))
    queryDto: QueryPostInputModel,
    @Param('id') blogId: string,
    @Req() req: Request,
  ) {
    const foundedBlog = await this.blogsQueryRepository.findById(blogId);
    if (!foundedBlog) {
      throw new NotFoundException();
    }
    return await this.postsQueryRepository.findAll(
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
    return await this.blogsQueryRepository.findById(blogId);
  }

  @HttpCode(201)
  @UseGuards(AuthBasicGuard)
  @Post(':id/posts')
  async createPostByBlogId(
    @Param('id') blogId: string,
    @Body() inputModel: CreatePostWithoutBlogIdInputModel,
  ) {
    const result = await this.commandBus.execute(
      new CreatePostByBlogIdCommand(inputModel, blogId),
    );

    if (result.hasError()) {
      new ErrorProcessor(result).errorHandling();
    }
    return result.data;
  }

  @HttpCode(204)
  @Put(':id')
  @UseGuards(AuthBasicGuard)
  async updateBlog(
    @Param('id') blogId: string,
    @Body() inputModel: BlogCreateInputModel,
  ) {
    const result = await this.commandBus.execute(
      new UpdateBlogCommand(inputModel, blogId),
    );

    if (result.hasError()) {
      new ErrorProcessor(result).errorHandling();
    }
  }

  @Delete(':id')
  @UseGuards(AuthBasicGuard)
  @HttpCode(204)
  async deleteBlog(@Param('id') blogId: string) {
    const result = await this.commandBus.execute(new DeleteBlogCommand(blogId));
    if (result.hasError()) {
      new ErrorProcessor(result).errorHandling();
    }
    return;
  }
}
