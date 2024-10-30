import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../../users/infrastructure/users.repository';
import { JwtService } from '@nestjs/jwt';
import { LoginInputModel } from '../api/models/input/login.input.model';
import { ConfigService } from '@nestjs/config';
import { v4 } from 'uuid';
import { add } from 'date-fns';

import { SecurityService } from '../../security/application/security.service';
import { Configuration } from '@nestjs/cli/lib/configuration';
import { BcryptService } from '../../../../base/adapters/bcrypt-service';
import { BusinessService } from '../../../../base/domain/business-service';
import { InterlayerNotice } from '../../../../base/models/Interlayer';
import { PayloadTokenType } from '../../../../base/type/types';
import { SecurityRepository } from '../../security/infrastucture/security.repository';

@Injectable()
export class AuthService {
  constructor(
    protected usersRepository: UsersRepository,
    protected bcryptService: BcryptService,
    protected securityService: SecurityService,
    protected securityRepository: SecurityRepository,
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

    const payload = { username: user.accountData.userName, userId: user.id };

    return {
      accessToken: await this.jwtService.signAsync(payload, {
        secret: authSettings.JWT_SECRET,
        expiresIn: authSettings.AC_TIME,
      }),
    };
  }

  async createRefreshToken(userId: string, newDeviceId: string) {
    const authSettings = this.configService.get('authSettings', {
      infer: true,
    });

    const user = await this.usersRepository.findById(userId);

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

  async checkCredentials(loginInput: LoginInputModel) {
    const user = await this.usersRepository.findByLoginOrEmail(
      loginInput.loginOrEmail,
    );

    if (!user) {
      const result = new InterlayerNotice(null);
      result.addError('Unauthorization', 'loginOrEmail', 401);
      return result;
    }

    const checkedResult = await this.bcryptService.checkPassword(
      loginInput.password,
      user.accountData.passwordHash,
    );
    if (!checkedResult) {
      const result = new InterlayerNotice(null);
      result.addError('Unauthorization', 'password', 401);
      return result;
    }
    return new InterlayerNotice(null);
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

    const payloadAccessToken = await this.verifyAndGetPayloadToken(
      auth[1],
      authSettings.JWT_SECRET,
    );

    if (!payloadAccessToken) {
      const result = new InterlayerNotice(null);
      result.addError('Wrong access token', 'access token', 401);

      return result;
    }

    const user = await this.usersRepository.findById(payloadAccessToken.userId);

    if (!user) {
      const result = new InterlayerNotice(null);
      result.addError('User not found', 'user id', 401);

      return result;
    }

    return new InterlayerNotice(payloadAccessToken.userId);
  }

  async verifyAndGetPayloadToken(
    token: string,
    secretCode: string,
  ): Promise<PayloadTokenType | null> {
    try {
      const result: any = await this.jwtService.verifyAsync(token, {
        secret: secretCode,
      });

      if (result.deviceId) {
        return { userId: result.userId, deviceId: result.deviceId };
      } else return { userId: result.userId };
    } catch (error) {
      console.log('Not verify!');
      return null;
    }
  }

  async checkRefreshToken(refreshToken: string) {
    const authSettings = this.configService.get('authSettings', {
      infer: true,
    });

    const decode = await this.jwtService.decode(refreshToken);

    if (!decode) {
      const result = new InterlayerNotice(null);
      result.addError('Wrong authorization', 'access token', 401);

      return result;
    }

    const payloadRefreshToken = await this.verifyAndGetPayloadToken(
      refreshToken,
      authSettings.JWT_SECRET,
    );

    if (!payloadRefreshToken) {
      const result = new InterlayerNotice(null);
      result.addError('Wrong access token', 'refresh token', 401);

      return result;
    }

    const user = await this.usersRepository.findById(
      payloadRefreshToken.userId,
    );

    if (!user) {
      const result = new InterlayerNotice(null);
      result.addError('User not found', 'user id', 401);

      return result;
    }

    const session = await this.securityRepository.getSession(
      payloadRefreshToken.userId,
      payloadRefreshToken.deviceId!,
      new Date(decode.iat * 1000),
    );

    if (!session) {
      const result = new InterlayerNotice(null);
      result.addError('Not found session', 'session', 401);

      return result;
    }
    return new InterlayerNotice(payloadRefreshToken);
  }

  async returnNewTokens(oldRefreshToken: string, userId: string) {
    const newAccessToken = await this.createAccessToken(userId);

    const payloadOldRefreshToken = await this.decodeToken(oldRefreshToken);

    const session = await this.securityRepository.getSession(
      payloadOldRefreshToken.userId,
      payloadOldRefreshToken.deviceId!,
      new Date(payloadOldRefreshToken.iat * 1000),
    );

    // const newDeviceId = uuid();
    const { refreshToken } = await this.createRefreshToken(
      userId,
      payloadOldRefreshToken.deviceId,
    );

    const newPayloadRefreshToken = await this.decodeToken(refreshToken);

    await this.securityService.updateSession(
      session.id,
      new Date(newPayloadRefreshToken.iat * 1000),
      new Date(newPayloadRefreshToken.exp * 1000),
    );

    return {
      newAccessToken,
      refreshToken: refreshToken,
    };
  }

  async decodeToken(token: string): Promise<any> {
    try {
      return this.jwtService.decode(token);
    } catch (e: unknown) {
      console.error('Cant decode token', e);
      return null;
    }
  }
}
