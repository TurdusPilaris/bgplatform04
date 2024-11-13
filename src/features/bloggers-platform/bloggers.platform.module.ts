import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CqrsModule } from '@nestjs/cqrs';
import { CreatePostUseCase } from './posts/application/use-cases/create-post-use-case';
import { CreatePostByBlogIdUseCase } from './posts/application/use-cases/create-post-by-blogId-use-case';
import { UpdatePostUseCase } from './posts/application/use-cases/update-post-use-case';
import { DeletePostUseCase } from './posts/application/use-cases/delete-post-use-case';
import { DeleteBlogUseCase } from './blogs/application/use-cases/delete-blog-use-case';
import { CreateBlogUseCase } from './blogs/application/use-cases/create-blog-use-case';
import { UpdateBlogUseCase } from './blogs/application/use-cases/update-blog-use-case';
import { UpdateCommentUseCase } from './comments/application/use-cases/update-comment-use-case';
import { CreateLikeUseCase } from './comments/application/use-cases/create-like-use-case';
import { CreateCommentUseCase } from './comments/application/use-cases/create-comment-use-case';
import { DeleteCommentUseCase } from './comments/application/use-cases/delete-comment-use-case';
import { Blog, BlogSchema } from './blogs/domain/entiities/blog.entity';
import { PostClass, PostSchema } from './posts/domain/entiities/post.entity';
import {
  Comment,
  CommentSchema,
} from './comments/domain/entities/comment.entity';
import { Like, LikeSchema } from './comments/domain/entities/like.entity';
import { UserAccountsModule } from '../user-accaunts/users.accounts.module';
import { BlogsSaController } from './blogs/api/blogs.sa.controller';
import { PostsController } from './posts/api/posts.controller';
import { CommentsController } from './comments/api/comments.controller';
import { BlogsRepository } from './blogs/infrastructure/blogs.repository';
import { BlogsQueryRepository } from './blogs/infrastructure/blogs.query-repository';
import { PostsRepository } from './posts/infrastructure/posts.repository';
import { PostsQueryRepository } from './posts/infrastructure/posts.query-repository';
import { CommentsRepository } from './comments/infrastructure/comments.repository';
import { CommentsQueryRepository } from './comments/infrastructure/comments.query-repository';
import { BlogsSqlRepository } from './blogs/infrastructure/blogs.sql.repository';
import { BlogsSqlQueryRepository } from './blogs/infrastructure/blogs.sql.query-repository';
import { PostsSqlRepository } from './posts/infrastructure/posts.sql.repository';
import { PostsSqlQueryRepository } from './posts/infrastructure/posts.sql.query-repository';
import { BlogsController } from './blogs/api/blogs.controller';
import { CommentsSqlRepository } from './comments/infrastructure/comments.sql.repository';
import { CommentsSqlQueryRepository } from './comments/infrastructure/comments.sql.query-repository';
import { LikesSqlRepository } from './likes/infrastructure/likes.sql.repository';

const useCasesForPost = [
  CreatePostUseCase,
  CreatePostByBlogIdUseCase,
  UpdatePostUseCase,
  DeletePostUseCase,
];
const useCasesForBlog = [
  DeleteBlogUseCase,
  CreateBlogUseCase,
  UpdateBlogUseCase,
];
const useCasesForComment = [
  UpdateCommentUseCase,
  CreateLikeUseCase,
  CreateCommentUseCase,
  DeleteCommentUseCase,
];
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: PostClass.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: Like.name, schema: LikeSchema },
    ]),
    UserAccountsModule,
    CqrsModule,
  ],
  controllers: [
    BlogsSaController,
    PostsController,
    CommentsController,
    BlogsController,
  ],
  providers: [
    ...useCasesForPost,
    ...useCasesForBlog,
    ...useCasesForComment,
    BlogsRepository,
    BlogsQueryRepository,
    BlogsSqlRepository,
    BlogsSqlQueryRepository,
    PostsRepository,
    PostsSqlRepository,
    PostsQueryRepository,
    PostsSqlQueryRepository,
    CommentsRepository,
    CommentsQueryRepository,
    CommentsSqlRepository,
    CommentsSqlQueryRepository,
    LikesSqlRepository,
  ],
  exports: [BlogsSqlRepository],
})
export class BloggersPlatformModule {}
