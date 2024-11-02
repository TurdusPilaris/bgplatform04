import { LoginInputModel } from '../../api/models/input/login.input.model';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { BcryptService } from '../../../../../base/adapters/bcrypt-service';
import { InterlayerNotice } from '../../../../../base/models/Interlayer';
import { ErrorProcessor } from '../../../../../base/models/errorProcessor';

export class LoginCommand {
  constructor(public loginInput: LoginInputModel) {}
}
@CommandHandler(LoginCommand)
export class LoginUseCase implements ICommandHandler<LoginCommand> {
  constructor(
    private usersRepository: UsersRepository,
    private bcryptService: BcryptService,
  ) {}

  async execute(command: LoginCommand): Promise<any> {
    const loginInput = command.loginInput;

    //check user
    const user = await this.usersRepository.findByLoginOrEmail(
      loginInput.loginOrEmail,
    );

    //check password
    const resultCheckCredentials = await this.checkCredentials(
      loginInput.password,
      user.accountData.passwordHash,
    );
    if (resultCheckCredentials.hasError()) {
      new ErrorProcessor(resultCheckCredentials).handleError();
    }

    //сначала сделаем аксесс токен
    // const accessToken = await this.authService.createAccessToken(user.id);
  }

  async checkCredentials(password: string, passwordHash: string) {
    const checkedResult = await this.bcryptService.checkPassword(
      password,
      passwordHash,
    );
    if (!checkedResult) {
      const result = new InterlayerNotice(null);
      result.addError('Unauthorization', 'password', 401);
      return result;
    }
    return new InterlayerNotice(null);
  }
}
