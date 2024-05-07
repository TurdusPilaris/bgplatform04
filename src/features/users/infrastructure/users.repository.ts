import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  User,
  UserDocument,
  UserModelType,
} from '../domain/entities/user.entity';
import { UserCreateModel } from '../api/models/input/create-user.input.model';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(User.name)
    private UserModel: UserModelType,
  ) {}
  createUser(inputModel: UserCreateModel): Promise<UserDocument> {
    const newUser = this.UserModel.createdNewUser(inputModel, this.UserModel);
    return newUser.save();
  }
}
