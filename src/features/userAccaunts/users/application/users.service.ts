import { UsersRepository } from '../infrastructure/users.repository';
import { UserCreateModel } from '../api/models/input/create-user.input.model';
import { Injectable } from '@nestjs/common';
import { UserDocument } from '../domain/entities/user.entity';
import { BcryptService } from '../../../../base/adapters/bcrypt-service';
import { BusinessService } from '../../../../base/domain/business-service';
import { InterlayerNotice } from '../../../../base/models/Interlayer';
import { UsersQueryRepository } from '../infrastructure/users.query-repository';

@Injectable()
export class UsersService {
  constructor(
    private usersRepository: UsersRepository,
    private usersQueryRepository: UsersQueryRepository,
    protected bcryptService: BcryptService,
    protected businessService: BusinessService,
  ) {}

  async create(createInputUser: UserCreateModel) {
    const foundedUserEmail = await this.usersRepository.findByLoginOrEmail(
      createInputUser.email,
    );

    if (foundedUserEmail) {
      const result = new InterlayerNotice(null);
      result.addError('email is not unique', 'email', 400);
      return result;
    }
    const foundedUserLogin = await this.usersRepository.findByLoginOrEmail(
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
    //create user
    const createdUser = await this.usersRepository.createUser(
      createInputUser,
      passwordHash,
    );
    try {
      this.businessService.sendRegisrtationEmail(
        createInputUser.email,
        createdUser.emailConfirmation.confirmationCode,
      );
    } catch (e: unknown) {
      console.error('Send email error', e);
    }

    return new InterlayerNotice(
      this.usersQueryRepository.userOutputModelMapper(createdUser),
    );
  }

  async findById(userId: string): Promise<UserDocument | null> {
    return await this.usersRepository.findById(userId);
  }

  async delete(userId: string): Promise<InterlayerNotice> {
    // if user wasn't found we will return an error
    const foundedUser = await this.findById(userId);
    if (!foundedUser) {
      const resultObject = new InterlayerNotice(null);
      resultObject.addError('User is not exists', 'userId', 404);
      return resultObject;
    }

    //delete user
    await this.usersRepository.delete(userId);

    //return information about success
    return new InterlayerNotice(null);
  }
}

export type UsersServiceSettings = {
  count: number;
};
