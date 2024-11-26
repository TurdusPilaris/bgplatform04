import { UserCreateModel } from '../api/models/input/create-user.input.model';
import { Injectable } from '@nestjs/common';
import { BcryptService } from '../../../../base/adapters/bcrypt-service';
import { BusinessService } from '../../../../base/domain/business-service';
import { InterlayerNotice } from '../../../../base/models/Interlayer';
import { UserCreateSqlModel } from '../api/models/sql/create-user.sql.model';
import { v4 } from 'uuid';
import { add } from 'date-fns';
import { UsersSqlRepository } from '../infrastructure/users.sql.repositories';
import { UsersSqlQueryRepository } from '../infrastructure/users.sql.query-repositories';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from '../domain/entities/user.sql.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
    private usersSqlRepository: UsersSqlRepository,
    protected bcryptService: BcryptService,
    protected businessService: BusinessService,
    protected usersSqlQueryRepository: UsersSqlQueryRepository,
  ) {}

  async create(createInputUser: UserCreateModel) {
    // : Promise<InterlayerNotice<UserOutputModel | null>>
    //check if there is a user with this email
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
    const createdUserId =
      await this.usersSqlRepository.createUser(userCreateSql);

    const createdUser =
      await this.usersSqlQueryRepository.findById(createdUserId);
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
    const foundedUser = await this.usersSqlRepository.findById(userId);
    if (!foundedUser) {
      const resultObject = new InterlayerNotice(null);
      resultObject.addError('User is not exists', 'userId', 404);
      return resultObject;
    }

    //delete user
    await this.usersSqlRepository.delete(userId);

    //return information about success
    return new InterlayerNotice(null);
  }
}
