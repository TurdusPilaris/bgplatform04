import { UserCreateModel } from '../../../users/api/models/input/create-user.input.model';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { BcryptService } from '../../../../../base/adapters/bcrypt-service';
import { BusinessService } from '../../../../../base/domain/business-service';
import { InterlayerNotice } from '../../../../../base/models/Interlayer';

export class RegisterUserCommand {
  constructor(public createInputUser: UserCreateModel) {}
}

@CommandHandler(RegisterUserCommand)
export class RegisterUserUseCase
  implements ICommandHandler<RegisterUserCommand>
{
  constructor(
    private usersRepository: UsersRepository,
    private bcryptService: BcryptService,
    private businessService: BusinessService,
  ) {}

  async execute(command: RegisterUserCommand): Promise<InterlayerNotice> {
    const foundedUserEmail = await this.usersRepository.findByLoginOrEmail(
      command.createInputUser.email,
    );
    if (foundedUserEmail) {
      const result = new InterlayerNotice(null);
      result.addError('email is not unique', 'email', 400);
      return result;
    }
    const foundedUserLogin = await this.usersRepository.findByLoginOrEmail(
      command.createInputUser.login,
    );
    if (foundedUserLogin) {
      const result = new InterlayerNotice(null);
      result.addError('Login is not unique', 'login', 400);
      return result;
    }
    //create hash
    const passwordHash = await this.bcryptService.generationHash(
      command.createInputUser.password,
    );
    //create user
    const createdUser = await this.usersRepository.createUser(
      command.createInputUser,
      passwordHash,
    );
    //TODO move send email to event handler
    try {
      this.businessService.sendRegisrtationEmail(
        command.createInputUser.email,
        createdUser.emailConfirmation.confirmationCode,
      );
    } catch (e: unknown) {
      console.error('Send email error', e);
    }

    return new InterlayerNotice(null);
  }
}
