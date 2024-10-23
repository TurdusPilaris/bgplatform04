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
import { AuthBasicGuard } from '../../../infrastructure/guards/auth.basic.guard';
import { CreatePostWithoutBlogIdInputModel } from '../../posts/api/models/input/create-post-withoutBlogId.input.model';
import { GetOptionalUserGard } from '../../../infrastructure/guards/get-optional-user-gard.service';
import { UpdateBlogCommand } from '../application/use-cases/update-blog-use-case';
import { CreatePostByBlogIdCommand } from '../../posts/application/use-cases/create-post-by-blogId-use-case';

@Controller('blogs')
export class BlogsController {
  constructor(
    private commandBus: CommandBus,
    protected blogsQueryRepository: BlogsQueryRepository,
    protected postsQueryRepository: PostsQueryRepository,
  ) {}

  @Get()
  async getBlogs(
    @Query(new ValidationPipe({ transform: true, stopAtFirstError: true }))
    queryDto: QueryBlogInputModel,
  ) {
    return await this.blogsQueryRepository.findAll(queryDto);
  }

  @Post()
  @UseGuards(AuthBasicGuard)
  async createBlog(
    @Body()
    inputModel: BlogCreateInputModel,
  ) {
    return await this.commandBus.execute(new CreateBlogCommand(inputModel));
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

  @UseGuards(GetOptionalUserGard)
  @Get(':id/posts')
  async getPostsByBlogId(
    @Query(new ValidationPipe({ transform: true }))
    queryDto: QueryPostInputModel,
    @Param('id') blogId: string,
    @Req() req: any,
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
      if (result.code === 404) {
        throw new NotFoundException();
      }
    }
  }

  @Delete(':id')
  @UseGuards(AuthBasicGuard)
  @HttpCode(204)
  async deleteBlog(@Param('id') blogId: string) {
    const result = await this.commandBus.execute(new DeleteBlogCommand(blogId));
    if (result.hasError()) {
      if (result.code === 404) {
        throw new NotFoundException();
      }
    }
    return;
  }
}
