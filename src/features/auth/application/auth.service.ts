import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../../users/infrastructure/users.repository';
import { JwtService } from '@nestjs/jwt';
import { UserCreateModel } from '../../users/api/models/input/create-user.input.model';
import { InterlayerNotice } from '../../../base/models/Interlayer';
import { BcryptService } from '../../../base/adapters/bcrypt-service';
import { BusinessService } from '../../../base/domain/business-service';
import { CodeConfirmationModel } from '../api/models/input/code.confirmation.model';
import { LoginInputModel } from '../api/models/input/login.input.model';
import { ConfigService } from '@nestjs/config';
import { Configuration } from '../../../settings/configuration';
import { v4 } from 'uuid';
import { add } from 'date-fns';

@Injectable()
export class AuthService {
  constructor(
    protected usersRepository: UsersRepository,
    protected bcryptService: BcryptService,
    protected businessService: BusinessService,
    private jwtService: JwtService,
    private configService: ConfigService<Configuration, true>,
  ) {}

  async validateBasicUser(auth: string) {
    const ADMIN_AUTH_BASE64 = 'Basic YWRtaW46cXdlcnR5';
    return auth === ADMIN_AUTH_BASE64;
  }

  async createToken(userId: string) {
    const authSettings = this.configService.get('authSettings', {
      infer: true,
    });

    const user = await this.usersRepository.findById(userId);
    // if (user?.password !== pass) {
    //   throw new UnauthorizedException();
    // }
    const payload = { username: user.accountData.userName, id: user.id };
    return {
      accessToken: await this.jwtService.signAsync(payload, {
        secret: authSettings.JWT_SECRET,
      }),
    };
  }

  // async registerUser(inputModel: UserCreateModel): Promise<InterlayerNotice> {
  // const passwordHash = await this.bcryptService.generationHash(inputModel.password);
  //
  // const createdUser = await this.usersRepository.createBasicUser(inputModel);
  //
  // try {
  //   this.businessService.sendRegisrtationEmail(inputModel.email, createdUser.emailConfirmation.confirmationCode);
  // } catch (e: unknown) {
  //   console.error('Send email error', e);
  // }
  //
  // //return information about success
  //     return new InterlayerNotice(null);
  // }
  async registerUser(createInputUser: UserCreateModel) {
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

    return new InterlayerNotice(null);
  }

  async registrationConfirmation(inputCode: CodeConfirmationModel) {
    const foundedUser = await this.usersRepository.findByCodeConfirmation(
      inputCode.code,
    );

    if (!foundedUser) {
      const result = new InterlayerNotice(null);
      result.addError('Not found user', 'code', 400);
      return result;
    }
    if (foundedUser.emailConfirmation.isConfirmed) {
      const result = new InterlayerNotice(null);
      result.addError('Code confirmation already been applied', 'code', 400);
      return result;
    }
    if (foundedUser.emailConfirmation.expirationDate < new Date()) {
      const result = new InterlayerNotice(null);
      result.addError('Code confirmation is expired', 'code', 400);
      return result;
    }

    await this.usersRepository.updateConfirmation(foundedUser.id);

    return new InterlayerNotice(null);
  }

  async checkCredentials(loginInput: LoginInputModel) {
    const user = await this.usersRepository.findByLoginOrEmail(
      loginInput.loginOrEmail,
    );
    console.log('loginInput', loginInput);
    console.log('user', user);

    // if (!user || !user.emailConfirmation.isConfirmed) {
    if (!user) {
      console.log('Im a problem');
      const result = new InterlayerNotice(null);
      result.addError('Unauthorisation', 'loginOrEmail', 401);
      return result;
    }
    console.log('Im not a problem');
    const checkedResult = await this.bcryptService.checkPassword(
      loginInput.password,
      user.accountData.passwordHash,
    );
    if (!checkedResult) {
      console.log('Im a not password corect');
      const result = new InterlayerNotice(null);
      result.addError('Unauthorisation', 'password', 401);
      return result;
    }
    return new InterlayerNotice(null);
  }

  async getTokenForUser(loginOrEmail: string) {
    const user = await this.usersRepository.findByLoginOrEmail(loginOrEmail);

    return await this.createToken(user.id);
  }

  async resendingEmail(email: string) {
    const foundedUser = await this.usersRepository.findByLoginOrEmail(email);

    if (!foundedUser) {
      const result = new InterlayerNotice(null);
      result.addError('Not found user', 'email', 400);
      return result;
    }
    if (foundedUser.emailConfirmation.isConfirmed) {
      const result = new InterlayerNotice(null);
      result.addError('Code confirmation already been applied', 'email', 400);
      return result;
    }

    const newConfirmationCode = v4();
    await this.usersRepository.updateConfirmationCode(
      foundedUser._id,
      newConfirmationCode,
      add(new Date(), {
        hours: 58,
        minutes: 3,
      }),
    );

    try {
      this.businessService.sendRegisrtationEmail(email, newConfirmationCode);
    } catch (e: unknown) {
      console.error('Send email error', e);
    }

    return new InterlayerNotice(null);
  }

  async recoveryPasswordSendCode(email: string) {
    const foundedUser = await this.usersRepository.findByLoginOrEmail(email);

    if (!foundedUser) {
      const result = new InterlayerNotice(null);
      result.addError('Not found user', 'code', 400);
      return result;
    }

    const newConfirmationCode = v4();

    await this.usersRepository.updateConfirmationCode(
      foundedUser._id,
      newConfirmationCode,
      add(new Date(), {
        hours: 58,
        minutes: 3,
      }),
    );

    try {
      this.businessService.sendRecoveryPassword(email, newConfirmationCode);
    } catch (e: unknown) {
      console.error('Send email error', e);
    }

    return new InterlayerNotice(null);
  }
}
