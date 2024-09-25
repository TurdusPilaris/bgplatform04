import { Controller, Delete, HttpCode, Post, Res } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogModelType } from '../blogs/domain/entiities/blog.entity';
import { User, UserModelType } from '../users/domain/entities/user.entity';
import { Response } from 'express';
import { PostModelType } from '../posts/domain/entiities/post.entity';
@Controller('testing')
export class TestingController {
  constructor(
    @InjectModel(Blog.name)
    private BlogModel: BlogModelType,
    @InjectModel(User.name)
    private UserModel: UserModelType,
    @InjectModel(Post.name)
    private PostModel: PostModelType,
  ) {}
  @Delete('all-data')
  @HttpCode(204)
  async allDelete() {
    await this.BlogModel.deleteMany({});
    await this.PostModel.deleteMany({});
    await this.UserModel.deleteMany({});
  }
}
