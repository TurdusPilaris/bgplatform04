import { UserCreateModel } from '../../../users/api/models/input/create-user.input.model';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BcryptService } from '../../../../../base/adapters/bcrypt-service';
import { BusinessService } from '../../../../../base/domain/business-service';
import { InterlayerNotice } from '../../../../../base/models/Interlayer';
import { UsersSqlRepository } from '../../../users/infrastructure/users.sql.repositories';
import { UserCreateSqlModel } from '../../../users/api/models/sql/create-user.sql.model';
import { add } from 'date-fns';
import { v4 } from 'uuid';

export class RegisterUserCommand {
  constructor(public createInputUser: UserCreateModel) {}
}

@CommandHandler(RegisterUserCommand)
export class RegisterUserUseCase
  implements ICommandHandler<RegisterUserCommand>
{
  constructor(
    private usersSqlRepository: UsersSqlRepository,
    private bcryptService: BcryptService,
    private businessService: BusinessService,
  ) {}

  async execute(command: RegisterUserCommand): Promise<InterlayerNotice> {
    const createInputUser = command.createInputUser;
    const foundedUserEmail = await this.usersSqlRepository.findByLoginOrEmail(
      createInputUser.email,
    );
    if (foundedUserEmail) {
      const result = new InterlayerNotice(null);
      result.addError('email is not unique', 'email', 400);
      return result;
    }
    const foundedUserLogin = await this.usersSqlRepository.findByLoginOrEmail(
      createInputUser.login,
    );
    if (foundedUserLogin) {
      const result = new InterlayerNotice(null);
      result.addError('Login is not unique', 'login', 400);
      return result;
    }
    //create hash
    const passwordHash = await this.bcryptService.generationHash(
      createInputUser.password,
    );
    const confirmationCode = v4();

    const userCreateSql: UserCreateSqlModel = {
      userName: createInputUser.login,
      email: createInputUser.email,
      passwordHash: passwordHash,
      createdAt: new Date(),
      confirmationCode: confirmationCode,
      expirationDate: add(new Date(), {
        hours: 99,
        minutes: 3,
      }),
      isConfirmed: false,
    };
    //create user
    const createdUserId =
      await this.usersSqlRepository.createUser(userCreateSql);
    const createdUser = await this.usersSqlRepository.findById(createdUserId);
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
