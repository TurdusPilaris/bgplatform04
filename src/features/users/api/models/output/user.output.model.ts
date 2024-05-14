import { UserDocument } from '../../../domain/entities/user.entity';

export class UserOutputModel {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

// MAPPERS

export const UserOutputModelMapper = (user: UserDocument): UserOutputModel => {
  const outputModel = new UserOutputModel();
  outputModel.id = user.id;
  outputModel.name = user.accountData.userName;
  outputModel.email = user.accountData.email;
  outputModel.createdAt = user.accountData.createdAt.toISOString();

  return outputModel;
};
