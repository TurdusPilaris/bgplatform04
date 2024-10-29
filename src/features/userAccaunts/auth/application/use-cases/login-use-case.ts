import { LoginInputModel } from '../../api/models/input/login.input.model';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthService } from '../auth.service';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { BcryptService } from '../../../../../base/adapters/bcrypt-service';

export class LoginCommand {
  constructor(public loginInput: LoginInputModel) {}
}
@CommandHandler(LoginCommand)
export class LoginUseCase implements ICommandHandler<LoginCommand> {
  constructor(
    private usersRepository: UsersRepository,
    private bcryptService: BcryptService,
  ) {}

  async execute(command: LoginCommand): Promise<any> {}

  async checkCredentials(loginInput: LoginInputModel) {}
}
