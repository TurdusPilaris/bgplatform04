import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { UserCreateModel } from '../../api/models/input/create-user.input.model';

export type UserDocument = HydratedDocument<User>;

@Schema({ _id: false, id: false, versionKey: false })
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

@Schema({ _id: false, id: false, versionKey: false })
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

@Schema()
export class User {
  @Prop()
  login: string;

  @Prop({ type: UserAccountDataSchema })
  accountData: UserAccountData;

  @Prop({ type: UserEmailConfirmationSchema })
  emailConfirmation: UserEmailConfirmation;

  static createdNewUser(dto: UserCreateModel, UserModel: UserModelType) {
    /**
     * нужно навешивать декоратор схема для регистрации модели в базе
     */

    const createUser = new UserModel({
      accountData: {
        email: dto.email,
        userName: dto.login,
        createdAt: new Date(),
      },
    });

    return createUser;
  }
}

export type UserModelStaticType = {
  createNewUser: (
    dto: UserCreateModel,
    UserModel: UserModelType,
  ) => UserDocument;
};
export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.statics = {
  createNewUser: User.createdNewUser,
} as UserModelStaticType;

export type UserModelType = Model<UserDocument> & UserModelStaticType;
