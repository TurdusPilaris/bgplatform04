import { LoginInputModel } from '../../api/models/input/login.input.model';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BcryptService } from '../../../../../base/adapters/bcrypt-service';
import { InterlayerNotice } from '../../../../../base/models/Interlayer';
import { ErrorProcessor } from '../../../../../base/models/errorProcessor';
import { UsersSqlRepository } from '../../../users/infrastructure/sql/users.sql.repositories';
import { UsersTorRepository } from '../../../users/infrastructure/tor/users.tor.repository';

export class LoginCommand {
  constructor(public loginInput: LoginInputModel) {}
}
@CommandHandler(LoginCommand)
export class LoginUseCase implements ICommandHandler<LoginCommand> {
  constructor(
    private usersSqlRepository: UsersSqlRepository,
    private usersTorRepository: UsersTorRepository,
    private bcryptService: BcryptService,
  ) {}

  async execute(command: LoginCommand): Promise<any> {
    const loginInput = command.loginInput;

    //check user
    const user = await this.usersTorRepository.findByLoginOrEmail(
      loginInput.loginOrEmail,
    );

    //check password
    const resultCheckCredentials = await this.checkCredentials(
      loginInput.password,
      user.passwordHash,
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
