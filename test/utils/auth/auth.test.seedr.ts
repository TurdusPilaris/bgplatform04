import { LoginInputModel } from '../../../src/features/user-accaunts/auth/api/models/input/login.input.model';
import { UserCreateModel } from '../../../src/features/user-accaunts/users/api/models/input/create-user.input.model';
import { EmailInputModel } from '../../../src/features/user-accaunts/auth/api/models/input/email.input.model';
import { NewPasswordRecoveryInputModel } from '../../../src/features/user-accaunts/auth/api/models/input/new.password.recovery.input.model';
import { CodeConfirmationModel } from '../../../src/features/user-accaunts/auth/api/models/input/code.confirmation.model';

export const authTestSeeder = {
  createLoginInputModel(userOutput: UserCreateModel): LoginInputModel {
    return {
      loginOrEmail: userOutput.login,
      password: userOutput.password,
    };
  },
  createEmailInputModel(): EmailInputModel {
    return {
      email: 'testovaelena636@gmail.com',
    };
  },
  createBadEmailInputModel(): EmailInputModel {
    return {
      email: 'testovaelena636!gmail.com',
    };
  },
  createNewPasswordRecoveryInputModel(
    code: string,
  ): NewPasswordRecoveryInputModel {
    return {
      newPassword: '999555',
      recoveryCode: code,
    };
  },

  createCodeConfirmationModel(code: string): CodeConfirmationModel {
    return {
      code: code,
    };
  },
};
