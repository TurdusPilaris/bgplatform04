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
import { BlogsRepository } from './blogs/infrastructure/mongo/blogs.repository';
import { BlogsQueryRepository } from './blogs/infrastructure/mongo/blogs.query-repository';
import { PostsRepository } from './posts/infrastructure/mongo/posts.repository';
import { PostsQueryRepository } from './posts/infrastructure/mongo/posts.query-repository';
import { CommentsRepository } from './comments/infrastructure/mongo/comments.repository';
import { CommentsQueryRepository } from './comments/infrastructure/mongo/comments.query-repository';
import { BlogsSqlRepository } from './blogs/infrastructure/sql/blogs.sql.repository';
import { BlogsSqlQueryRepository } from './blogs/infrastructure/sql/blogs.sql.query-repository';
import { PostsSqlRepository } from './posts/infrastructure/sql/posts.sql.repository';
import { PostsSqlQueryRepository } from './posts/infrastructure/sql/posts.sql.query-repository';
import { BlogsController } from './blogs/api/blogs.controller';
import { CommentsSqlRepository } from './comments/infrastructure/sql/comments.sql.repository';
import { CommentsSqlQueryRepository } from './comments/infrastructure/sql/comments.sql.query-repository';
import { LikesSqlRepository } from './likes/infrastructure/likes.sql.repository';
import { UpdateLikeStatusUseCase } from './comments/application/use-cases/update-like-status-use-case';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostSQL } from './posts/domain/entiities/post.sql.entity';
import { BlogsTorQueryRepository } from './blogs/infrastructure/tor/blogs.tor.query-repository';
import { BlogsTorRepository } from './blogs/infrastructure/tor/blogs.tor.repository';
import { BlogSQL } from './blogs/domain/entiities/blog.sql.entity';
import { PostsTorRepository } from './posts/infrastructure/tor/posts.tor.repository';
import { PostsTorQueryRepository } from './posts/infrastructure/tor/posts.tor.query-repository';
import { CommentSQL } from './comments/domain/entities/comment.sql.entity';
import { CommentsTorRepository } from './comments/infrastructure/tor/comments.tor.repository';

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
  UpdateLikeStatusUseCase,
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
    TypeOrmModule.forFeature([PostSQL, BlogSQL, CommentSQL]),
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
    BlogsTorRepository,
    BlogsSqlQueryRepository,
    BlogsTorQueryRepository,
    PostsRepository,
    PostsSqlRepository,
    PostsTorRepository,
    PostsQueryRepository,
    PostsSqlQueryRepository,
    PostsTorQueryRepository,
    CommentsRepository,
    CommentsQueryRepository,
    CommentsSqlRepository,
    CommentsSqlQueryRepository,
    CommentsTorRepository,
    LikesSqlRepository,
  ],
  exports: [BlogsSqlRepository, BlogsTorRepository],
})
export class BloggersPlatformModule {}
