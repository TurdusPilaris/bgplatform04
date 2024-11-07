import { Controller, Delete, HttpCode } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Blog,
  BlogModelType,
} from '../bloggers-platform/blogs/domain/entiities/blog.entity';
import {
  User,
  UserModelType,
} from '../user-accaunts/users/domain/entities/user.entity';
import {
  PostClass,
  PostModelType,
} from '../bloggers-platform/posts/domain/entiities/post.entity';
import {
  Comment,
  CommentModelType,
} from '../bloggers-platform/comments/domain/entities/comment.entity';
import {
  Like,
  LikeModelType,
} from '../bloggers-platform/comments/domain/entities/like.entity';
import {
  DeviceAuthSession,
  DeviceAuthSessionModelType,
} from '../user-accaunts/security/domain/deviceAuthSession.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Controller('testing')
export class TestingController {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectModel(Blog.name)
    private BlogModel: BlogModelType,
    // @InjectModel(User.name)
    // private UserModel: UserModelType,
    @InjectModel(PostClass.name)
    private PostModel: PostModelType,
    @InjectModel(Comment.name)
    private CommentModel: CommentModelType,
    @InjectModel(Like.name)
    private LikeModel: LikeModelType,
    @InjectModel(DeviceAuthSession.name)
    private DeviceAuthSessionModel: DeviceAuthSessionModelType,
  ) {}
  @Delete('all-data')
  @HttpCode(204)
  async allDelete() {
    await this.BlogModel.deleteMany({});
    await this.PostModel.deleteMany({});
    //truncate devices
    const queryForDevices = `TRUNCATE TABLE public."DeviceAuthSession" CASCADE`;
    await this.dataSource.query(queryForDevices);
    //truncate users
    // await this.UserModel.deleteMany({});
    const queryForUsers = `TRUNCATE TABLE public."Users" CASCADE`;
    await this.dataSource.query(queryForUsers);

    await this.CommentModel.deleteMany({});
    await this.LikeModel.deleteMany({});
    // await this.DeviceAuthSessionModel.deleteMany({});
  }
}
