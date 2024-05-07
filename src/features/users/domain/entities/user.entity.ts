import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { UserCreateModel } from '../../api/models/input/create-user.input.model';

export type UserDocument = HydratedDocument<User>;

export class UserAccountData {
  @Prop({ required: true })
  userName: string;

  @Prop({ required: true })
  email: string;

  @Prop()
  passwordHash: string;

  @Prop()
  createdAt: Date;
}

export const UserAccountDataSchema =
  SchemaFactory.createForClass(UserAccountData);

export class UserEmailConfirmation {
  @Prop({ required: true })
  confirmationCode: string;

  @Prop({ required: true })
  expirationDate: string;

  @Prop({ default: false })
  isConfirmed: boolean;
}

export const UserEmailConfirmationSchema = SchemaFactory.createForClass(
  UserEmailConfirmation,
);
export class User {
  @Prop({ type: UserAccountDataSchema })
  accountData: UserAccountData;

  @Prop({ type: UserEmailConfirmationSchema })
  emailConfirmation: UserEmailConfirmation;

  static createdNewUser(dto: UserCreateModel, UserModel: UserModelType) {
    const createdUser = new UserModel({});
    createdUser.accountData = new UserAccountData();
    createdUser.accountData.userName = dto.login;
    createdUser.accountData.email = dto.email;
    return createdUser;
  }
}

export type UserModelStaticType = {
  createdNewUser: (
    dto: UserCreateModel,
    UserModel: UserModelType,
  ) => UserDocument;
};
export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.statics = {
  createdNewUser: User.createdNewUser,
} as UserModelStaticType;

export type UserModelType = Model<UserDocument> & UserModelStaticType;
