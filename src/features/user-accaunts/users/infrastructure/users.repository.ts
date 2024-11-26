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

  async createUser(
    inputModel: UserCreateModel,
    passwordHash: string,
  ): Promise<UserDocument> {
    const newUser = this.UserModel.createNewUser(
      inputModel,
      passwordHash,
      this.UserModel,
    );
    return newUser.save();
  }

  async findById(id: string): Promise<UserDocument | null> {
    const user = await this.UserModel.findById(id, { __v: false });
    if (!user) return null;
    return user;
  }

  // async delete(id: string) {
  //   return this.UserModel.deleteOne({
  //     _id: new Types.ObjectId(id),
  //   });
  // }

  async findByCodeConfirmation(code: string) {
    const filterCodeConfirmation = {
      'emailConfirmation.confirmationCode': {
        $regex: code ?? '',
        $options: 'i',
      },
    };

    return this.UserModel.findOne(filterCodeConfirmation);
  }

  async updateConfirmation(id: any) {
    await this.UserModel.updateOne(
      { _id: id },
      {
        // $set: {
        'emailConfirmation.isConfirmed': true,
      },
    );
  }

  async findByLoginOrEmail(loginOrEmail: string) {
    const filterLoginOrEmail = {
      $or: [
        {
          'accountData.userName': loginOrEmail,
        },
        { 'accountData.email': loginOrEmail },
      ],
    };
    return this.UserModel.findOne(filterLoginOrEmail);
  }

  async updateConfirmationCode(
    id: string,
    confirmationCode: string,
    expirationDate: Date,
  ) {
    await this.UserModel.updateOne(
      { id: id },
      {
        $set: {
          'emailConfirmation.confirmationCode': confirmationCode,
          'emailConfirmation.expirationDate': expirationDate,
          'emailConfirmation.isConfirmed': false,
        },
      },
    );
  }
}
