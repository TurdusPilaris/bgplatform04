import { LoginInputModel } from '../../api/models/input/login.input.model';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BcryptService } from '../../../../../base/adapters/bcrypt-service';
import { InterlayerNotice } from '../../../../../base/models/Interlayer';
import { ErrorProcessor } from '../../../../../base/models/errorProcessor';
import { UsersSqlRepository } from '../../../users/infrastructure/users.sql.repositories';

export class LoginCommand {
  constructor(public loginInput: LoginInputModel) {}
}
@CommandHandler(LoginCommand)
export class LoginUseCase implements ICommandHandler<LoginCommand> {
  constructor(
    private usersSqlRepository: UsersSqlRepository,
    private bcryptService: BcryptService,
  ) {}

  async execute(command: LoginCommand): Promise<any> {
    const loginInput = command.loginInput;

    //check user
    const user = await this.usersSqlRepository.findByLoginOrEmail(
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
