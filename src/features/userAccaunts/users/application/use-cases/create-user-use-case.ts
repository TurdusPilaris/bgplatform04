import { UserCreateModel } from '../../api/models/input/create-user.input.model';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  UserOutputModel,
  UserOutputModelMapper,
} from '../../api/models/output/user.output.model';
import { UsersRepository } from '../../infrastructure/users.repository';
import { BcryptService } from '../../../../../base/adapters/bcrypt-service';
import { BusinessService } from '../../../../../base/domain/business-service';
import { InterlayerNotice } from '../../../../../base/models/Interlayer';

export class CreateUserCommand {
  constructor(public inputModel: UserCreateModel) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<CreateUserCommand> {
  constructor(
    private usersRepository: UsersRepository,
    private bcryptService: BcryptService,
    private businessService: BusinessService,
  ) {}

  async execute(
    command: CreateUserCommand,
  ): Promise<InterlayerNotice<UserOutputModel | null>> {
    const foundedUserEmail = await this.usersRepository.findByLoginOrEmail(
      command.inputModel.email,
    );

    if (foundedUserEmail) {
      const result = new InterlayerNotice(null);
      result.addError('email is not unique', 'email', 400);
      return result;
    }
    const foundedUserLogin = await this.usersRepository.findByLoginOrEmail(
      command.inputModel.login,
    );
    if (foundedUserLogin) {
      const result = new InterlayerNotice(null);
      result.addError('Login is not unique', 'login', 400);
      return result;
    }

    // return UserOutputModelMapper(
    //   await this.usersRepository.createBasicUser(createInputUser),
    // );

    //create hash
    const passwordHash = await this.bcryptService.generationHash(
      command.inputModel.password,
    );
    //create user
    const createdUser = await this.usersRepository.createUser(
      command.inputModel,
      passwordHash,
    );
    try {
      this.businessService.sendRegisrtationEmail(
        command.inputModel.email,
        createdUser.emailConfirmation.confirmationCode,
      );
    } catch (e: unknown) {
      console.error('Send email error', e);
    }

    return new InterlayerNotice(UserOutputModelMapper(createdUser));
  }
}
