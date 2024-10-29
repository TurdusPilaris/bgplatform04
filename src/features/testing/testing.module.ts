import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Blog,
  BlogSchema,
} from '../bloggers-platform/blogs/domain/entiities/blog.entity';
import {
  PostClass,
  PostSchema,
} from '../bloggers-platform/posts/domain/entiities/post.entity';
import {
  Comment,
  CommentSchema,
} from '../bloggers-platform/comments/domain/entities/comment.entity';
import {
  Like,
  LikeSchema,
} from '../bloggers-platform/comments/domain/entities/like.entity';
import { TestingController } from './testing-controller';
import {
  User,
  UserSchema,
} from '../userAccaunts/users/domain/entities/user.entity';
import {
  DeviceAuthSession,
  DeviceAuthSessionSchema,
} from '../userAccaunts/security/domain/deviceAuthSession.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: PostClass.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: Like.name, schema: LikeSchema },
      { name: User.name, schema: UserSchema },
      { name: DeviceAuthSession.name, schema: DeviceAuthSessionSchema },
    ]),
  ],
  controllers: [TestingController],
})
export class TestingModule {}
