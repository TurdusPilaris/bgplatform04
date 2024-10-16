import { UserDocument } from '../../../domain/entities/user.entity';
import { AboutMeOutputModel } from '../../../../auth/api/models/output/about-me-output-model';

export class UserOutputModel {
  id: string;
  login: string;
  email: string;
  createdAt: string;
}

// MAPPERS

export const UserOutputModelMapper = (user: UserDocument): UserOutputModel => {
  const outputModel = new UserOutputModel();
  outputModel.id = user.id;
  outputModel.login = user.accountData.userName;
  outputModel.email = user.accountData.email;
  outputModel.createdAt = user.accountData.createdAt.toISOString();

  return outputModel;
};

export const AboutMeOutputModelMapper = (
  user: UserOutputModel,
): AboutMeOutputModel => {
  const outputModel = new AboutMeOutputModel();
  outputModel.login = user.login;
  outputModel.email = user.email;
  outputModel.userId = user.id;

  return outputModel;
};
