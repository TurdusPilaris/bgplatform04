import { LoginInputModel } from '../../../src/features/user-accaunts/auth/api/models/input/login.input.model';
import { UserCreateModel } from '../../../src/features/user-accaunts/users/api/models/input/create-user.input.model';

export const authTestSeeder = {
  createLoginInputModel(userOutput: UserCreateModel): LoginInputModel {
    return {
      loginOrEmail: userOutput.login,
      password: userOutput.password,
    };
  },
};
