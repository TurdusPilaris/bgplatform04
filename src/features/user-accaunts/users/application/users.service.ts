import { UserCreateModel } from '../api/models/input/create-user.input.model';
import { Inject, Injectable } from '@nestjs/common';
import { BcryptService } from '../../../../base/adapters/bcrypt-service';
import { BusinessService } from '../../../../base/domain/business-service';
import { InterlayerNotice } from '../../../../base/models/Interlayer';
import { UserCreateSqlModel } from '../api/models/sql/create-user.sql.model';
import { v4 } from 'uuid';
import { add } from 'date-fns';
import { UsersSqlRepository } from '../infrastructure/sql/users.sql.repositories';
import { UsersSqlQueryRepository } from '../infrastructure/sql/users.sql.query-repositories';
import {
  IUsersRepository,
  UsersTorRepository,
} from '../infrastructure/tor/users.tor.repository';
import { UserSQL } from '../domain/entities/user.sql.entity';
import { UsersTorQueryRepository } from '../infrastructure/tor/users.tor.query-repositories';

@Injectable()
export class UsersService {
  constructor(
    private usersSqlRepository: UsersSqlRepository,
    protected bcryptService: BcryptService,
    protected businessService: BusinessService,
    protected usersQueryRepository: UsersTorQueryRepository,
    protected usersTorRepository: UsersTorRepository,
    // @Inject('IUsersRepository') protected usersTorRepository: IUsersRepository,
  ) {}

  async create(createInputUser: UserCreateModel) {
    // : Promise<InterlayerNotice<UserOutputModel | null>>
    //check if there is a user with this email
    const foundedUserEmail = await this.usersTorRepository.findByLoginOrEmail(
      createInputUser.email,
    );
    if (foundedUserEmail) {
      const result = new InterlayerNotice(null);
      result.addError('email is not unique', 'email', 400);
      return result;
    }

    const foundedUserLogin = await this.usersTorRepository.findByLoginOrEmail(
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

    // const userCreateSql: UserCreateSqlModel = {
    //   userName: createInputUser.login,
    //   email: createInputUser.email,
    //   passwordHash: passwordHash,
    //   createdAt: new Date(),
    //   confirmationCode: confirmationCode,
    //   expirationDate: add(new Date(), {
    //     hours: 99,
    //     minutes: 3,
    //   }),
    //   isConfirmed: false,
    // };

    const userCreateSql = new UserSQL();
    userCreateSql.userName = createInputUser.login;
    userCreateSql.email = createInputUser.email;
    userCreateSql.passwordHash = passwordHash;
    userCreateSql.createdAt = new Date();
    userCreateSql.confirmationCode = confirmationCode;
    userCreateSql.expirationDate = add(new Date(), {
      hours: 99,
      minutes: 3,
    });
    userCreateSql.isConfirmed = false;

    const createdUserId =
      await this.usersTorRepository.createUser(userCreateSql);

    // const createdUser = await this.usersSqlQueryRepository.findById(
    //   createdUserId.id,
    // );
    const createdUser = await this.usersQueryRepository.findById(createdUserId);
    try {
      this.businessService.sendRegisrtationEmail(
        createInputUser.email,
        confirmationCode,
      );
    } catch (e: unknown) {
      console.error('Send email error', e);
    }

    return new InterlayerNotice(createdUser);
  }

  async delete(userId: string): Promise<InterlayerNotice> {
    // if user wasn't found we will return an error
    const foundedUser = await this.usersTorRepository.findById(userId);
    if (!foundedUser) {
      const resultObject = new InterlayerNotice(null);
      resultObject.addError('User is not exists', 'userId', 404);
      return resultObject;
    }

    //delete user
    await this.usersTorRepository.delete(userId);

    //return information about success
    return new InterlayerNotice(null);
  }
}
