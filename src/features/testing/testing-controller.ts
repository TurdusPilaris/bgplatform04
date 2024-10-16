import { Controller, Delete, HttpCode } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogModelType } from '../blogs/domain/entiities/blog.entity';
import { User, UserModelType } from '../users/domain/entities/user.entity';
import {
  PostClass,
  PostModelType,
} from '../posts/domain/entiities/post.entity';
import {
  Comment,
  CommentModelType,
} from '../comments/domain/entities/comment.entity';
import { Like, LikeModelType } from '../comments/domain/entities/like.entity';
import {
  DeviceAuthSession,
  DeviceAuthSessionModelType,
} from '../security/domain/deviceAuthSession.entity';
@Controller('testing')
export class TestingController {
  constructor(
    @InjectModel(Blog.name)
    private BlogModel: BlogModelType,
    @InjectModel(User.name)
    private UserModel: UserModelType,
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
    await this.UserModel.deleteMany({});
    await this.CommentModel.deleteMany({});
    await this.LikeModel.deleteMany({});
    await this.DeviceAuthSessionModel.deleteMany({});
  }
}
