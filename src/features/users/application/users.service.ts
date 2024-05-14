import { UsersRepository } from '../infrastructure/users.repository';
import { UserCreateModel } from '../api/models/input/create-user.input.model';
import { Injectable } from '@nestjs/common';
import {
  UserOutputModel,
  UserOutputModelMapper,
} from '../api/models/output/user.output.model';
import { UserDocument } from '../domain/entities/user.entity';
import { InterlayerNotice } from '../../../base/models/Interlayer';

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  async create(inputModel: UserCreateModel): Promise<UserOutputModel> {
    return UserOutputModelMapper(
      await this.usersRepository.createUser(inputModel),
    );
  }

  async findById(userId: string): Promise<UserDocument | null> {
    return await this.usersRepository.findById(userId);
  }

  async delete(userId: string): Promise<InterlayerNotice> {
    // if user wasn't found we will return an error
    const foundedUser = await this.findById(userId);
    if (!foundedUser) {
      const resultObject = new InterlayerNotice(null);
      resultObject.addError('User is not exists', 'userId', 404);
      return resultObject;
    }

    //delete user
    const deletedUser = await this.usersRepository.delete(userId);

    //Failed to create user
    if (deletedUser.deletedCount !== 1) {
      const resultObject = new InterlayerNotice(null);
      resultObject.addError('Failed to create user', 'userId', 502);
      return resultObject;
    }
    //return information about success
    return new InterlayerNotice(null);
  }
}
