import { InjectModel } from '@nestjs/mongoose';
import {
  User,
  UserDocument,
  UserModelType,
} from '../domain/entities/user.entity';

export class UsersQueryRepository {
  constructor(
    @InjectModel(User.name)
    private UserModel: UserModelType,
  ) {}

  async findById(id: string): Promise<UserDocument | null> {
    return this.UserModel.findById(id);
  }

  async findAll(): Promise<UserDocument[]> {
    return this.UserModel.find().exec();
  }
}
