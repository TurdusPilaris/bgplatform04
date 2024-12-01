import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginInputModel } from '../api/models/input/login.input.model';
import { ConfigService } from '@nestjs/config';

import { SecurityService } from '../../security/application/security.service';
import { Configuration } from '@nestjs/cli/lib/configuration';
import { BcryptService } from '../../../../base/adapters/bcrypt-service';
import { BusinessService } from '../../../../base/domain/business-service';
import { InterlayerNotice } from '../../../../base/models/Interlayer';
import { PayloadTokenType } from '../../../../base/type/types';

import { UsersSqlRepository } from '../../users/infrastructure/users.sql.repositories';
import { SecuritySqlRepository } from '../../security/infrastucture/security.sql.repository';
import { SecurityTorRepository } from '../../security/infrastucture/security.tor.repository';
import { UsersTorRepository } from '../../users/infrastructure/users.tor.repository';

@Injectable()
export class AuthService {
  constructor(
    protected usersSqlRepository: UsersSqlRepository,
    protected usersTorRepository: UsersTorRepository,
    protected bcryptService: BcryptService,
    protected securityService: SecurityService,
    protected securitySqlRepository: SecuritySqlRepository,
    protected securityTorRepository: SecurityTorRepository,
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

    const user = await this.usersTorRepository.findById(userId);

    const payload = { username: user.userName, userId: user.id };

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

    const user = await this.usersTorRepository.findById(userId);

    const payLoadRefreshToken = {
      userId: user!.id,
      deviceId: newDeviceId,
    };

    return {
      refreshToken: await this.jwtService.signAsync(payLoadRefreshToken, {
        secret: authSettings.JWT_SECRET,
        expiresIn: authSettings.AC_REFRESH_TIME,
      }),
      userId: user!.id,
      deviceId: newDeviceId,
    };
  }

  async checkCredentials(loginInput: LoginInputModel) {
    const user = await this.usersTorRepository.findByLoginOrEmail(
      loginInput.loginOrEmail,
    );

    if (!user) {
      const result = new InterlayerNotice(null);
      result.addError('Unauthorization', 'loginOrEmail', 401);
      return result;
    }

    const checkedResult = await this.bcryptService.checkPassword(
      loginInput.password,
      user.passwordHash,
    );
    if (!checkedResult) {
      const result = new InterlayerNotice(null);
      result.addError('Unauthorization', 'password', 401);
      return result;
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

    const user = await this.usersTorRepository.findById(
      payloadAccessToken.userId,
    );

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

    const user = await this.usersTorRepository.findById(
      payloadRefreshToken.userId,
    );

    if (!user) {
      const result = new InterlayerNotice(null);
      result.addError('User not found', 'user id', 401);

      return result;
    }

    const session = await this.securityTorRepository.getSession(
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

    const session = await this.securityTorRepository.getSession(
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
