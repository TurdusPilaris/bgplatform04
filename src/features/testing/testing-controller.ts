import { Controller, Delete, Res } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogModelType } from '../blogs/domain/entiities/blog.entity';
import { User, UserModelType } from '../users/domain/entities/user.entity';
import { Response } from 'express';
@Controller('testing')
export class TestingController {
  constructor(
    @InjectModel(Blog.name)
    private BlogModel: BlogModelType,
    @InjectModel(User.name)
    private UserModel: UserModelType,
  ) {}
  @Delete('all-data')
  async allDelete(@Res() response: Response) {
    await this.BlogModel.deleteMany({});
    await this.UserModel.deleteMany({});
    return response.status(204).send();
  }
}
