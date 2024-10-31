import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { UserCreateModel } from '../../api/models/input/create-user.input.model';
import { v4 } from 'uuid';
import { add } from 'date-fns';
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
  expirationDate: Date;

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

  static createNewBasicUser(dto: UserCreateModel, UserModel: UserModelType) {
    /**
     * нужно навешивать декоратор схема для регистрации модели в базе
     */

    return new UserModel({
      accountData: {
        email: dto.email,
        userName: dto.login,
        createdAt: new Date(),
      },
    });
  }

  static createNewUser(
    dto: UserCreateModel,
    passwordHash: string,
    UserModel: UserModelType,
  ) {
    /**
     * нужно навешивать декоратор схема для регистрации модели в базе
     */

    return new UserModel({
      accountData: {
        email: dto.email,
        userName: dto.login,
        passwordHash: passwordHash,
        createdAt: new Date(),
      },
      emailConfirmation: {
        confirmationCode: v4(),
        expirationDate: add(new Date(), {
          hours: 99,
          minutes: 3,
        }),
        isConfirmed: false,
      },
    });
  }
}

export type UserModelStaticType = {
  createNewBasicUser: (
    dto: UserCreateModel,
    UserModel: UserModelType,
  ) => UserDocument;
  createNewUser: (
    dto: UserCreateModel,
    passwordHash: string,
    UserModel: UserModelType,
  ) => UserDocument;
};
export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.statics = {
  createNewBasicUser: User.createNewBasicUser,
  createNewUser: User.createNewUser,
} as UserModelStaticType;

export type UserModelType = Model<UserDocument> & UserModelStaticType;
