import { UserCreateModel } from '../../api/models/input/create-user.input.model';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserOutputModel } from '../../api/models/output/user.output.model';
import { UsersRepository } from '../../infrastructure/users.repository';
import { BcryptService } from '../../../../../base/adapters/bcrypt-service';
import { BusinessService } from '../../../../../base/domain/business-service';
import { InterlayerNotice } from '../../../../../base/models/Interlayer';
import { UsersQueryRepository } from '../../infrastructure/users.query-repository';
import { UsersSqlRepository } from '../../infrastructure/users.sql.repositories';
import { UsersSqlQueryRepository } from '../../infrastructure/users.sql.query-repositories';
import { v4 } from 'uuid';
import { UserCreateSqlModel } from '../../api/models/sql/create-user.sql.model';
import { add } from 'date-fns';

export class CreateUserCommand {
  constructor(public inputModel: UserCreateModel) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<CreateUserCommand> {
  constructor(
    private usersRepository: UsersRepository,
    private usersSqlRepository: UsersSqlRepository,
    private usersQueryRepository: UsersQueryRepository,
    private usersSqlQueryRepository: UsersSqlQueryRepository,
    private bcryptService: BcryptService,
    private businessService: BusinessService,
  ) {}

  async execute(
    command: CreateUserCommand,
  ): Promise<InterlayerNotice<UserOutputModel | null>> {
    const foundedUserEmail = await this.usersSqlRepository.findByLoginOrEmail(
      command.inputModel.email,
    );

    if (foundedUserEmail) {
      const result = new InterlayerNotice(null);
      result.addError('email is not unique', 'email', 400);
      return result;
    }
    const foundedUserLogin = await this.usersSqlRepository.findByLoginOrEmail(
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
    const confirmationCode = v4();

    const userCreateSql: UserCreateSqlModel = {
      userName: command.inputModel.login,
      email: command.inputModel.email,
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
    try {
      this.businessService.sendRegisrtationEmail(
        command.inputModel.email,
        createdUser.emailConfirmation.confirmationCode,
      );
    } catch (e: unknown) {
      console.error('Send email error', e);
    }

    return new InterlayerNotice(
      this.usersSqlQueryRepository.userOutputModelMapper(createdUser),
    );
  }
}
