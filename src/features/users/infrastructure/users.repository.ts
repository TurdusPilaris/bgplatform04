import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  User,
  UserDocument,
  UserModelType,
} from '../domain/entities/user.entity';
import { UserCreateModel } from '../api/models/input/create-user.input.model';
import { Types } from 'mongoose';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(User.name)
    private UserModel: UserModelType,
  ) {}
  async createUser(inputModel: UserCreateModel): Promise<UserDocument> {
    const newUser = this.UserModel.createNewUser(inputModel, this.UserModel);
    return newUser.save();
  }

  async findById(id: string): Promise<UserDocument | null> {
    const user = await this.UserModel.findById(id, { __v: false });
    if (!user) return null;
    return user;
  }

  async delete(id: string) {
    return this.UserModel.deleteOne({
      _id: new Types.ObjectId(id),
    });
  }
}
