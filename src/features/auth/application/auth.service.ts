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
import { uuid } from 'uuidv4';

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

  async createAccessToken(userId: string) {
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
        expiresIn: authSettings.AC_TIME,
      }),
    };
  }

  async createRefreshToken(userId: string) {
    const authSettings = this.configService.get('authSettings', {
      infer: true,
    });

    const user = await this.usersRepository.findById(userId);

    const newDeviceId = uuid();

    const payLoadRefreshToken = {
      userId: user!._id,
      deviceId: newDeviceId,
    };

    return {
      refreshToken: await this.jwtService.signAsync(payLoadRefreshToken, {
        secret: authSettings.JWT_SECRET,
        expiresIn: authSettings.AC_REFRESH_TIME,
      }),
      userId: user!._id,
      deviceId: newDeviceId,
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

    if (!user) {
      const result = new InterlayerNotice(null);
      result.addError('Unauthorisation', 'loginOrEmail', 401);
      return result;
    }

    const checkedResult = await this.bcryptService.checkPassword(
      loginInput.password,
      user.accountData.passwordHash,
    );
    if (!checkedResult) {
      const result = new InterlayerNotice(null);
      result.addError('Unauthorisation', 'password', 401);
      return result;
    }
    return new InterlayerNotice(null);
  }

  async getTokenForUser(loginOrEmail: string) {
    const user = await this.usersRepository.findByLoginOrEmail(loginOrEmail);

    return await this.createAccessToken(user.id);
  }

  async getRefreshTokenForUser(loginOrEmail: string) {
    const user = await this.usersRepository.findByLoginOrEmail(loginOrEmail);

    return await this.createRefreshToken(user.id);
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

  async checkAccessToken(authHeader: string) {
    const auth = authHeader.split(' ');
    if (auth[0] !== 'Bearer') {
      const result = new InterlayerNotice(null);
      result.addError('Wrong authorization', 'access token', 401);

      return result;
    }

    const authSettings = this.configService.get('authSettings', {
      infer: true,
    });

    const decode = await this.jwtService.decode(auth[1]);

    if (!decode) {
      const result = new InterlayerNotice(null);
      result.addError('Wrong authorization', 'access token', 401);

      return result;
    }

    const payloadAccessToken = await this.jwtService.verify(auth[1], {
      secret: authSettings.JWT_SECRET,
    });

    if (!payloadAccessToken) {
      const result = new InterlayerNotice(null);
      result.addError('Wrong access token', 'access token', 401);

      return result;
    }

    const user = await this.usersRepository.findById(payloadAccessToken.id);

    if (!user) {
      const result = new InterlayerNotice(null);
      result.addError('User not found', 'user id', 401);

      return result;
    }

    return new InterlayerNotice(payloadAccessToken.id);
  }
}
