import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

import { Request } from 'express';
import { UsersService } from '../../features/user-accaunts/users/application/users.service';
import { AuthService } from '../../features/user-accaunts/auth/application/auth.service';

@Injectable()
export class AuthRefreshTokenGuard implements CanActivate {
  constructor(
    protected usersService: UsersService,
    protected authService: AuthService,
  ) {}
  async canActivate(context: ExecutionContext) {
    // : boolean | Promise<boolean> | Observable<boolean>
    const request: Request = context.switchToHttp().getRequest();

    if (!request.cookies) {
      throw new UnauthorizedException();
    }

    if (!request.cookies.refreshToken) {
      throw new UnauthorizedException();
    }

    const result = await this.authService.checkRefreshToken(
      request.cookies.refreshToken,
    );

    if (result.hasError()) {
      throw new UnauthorizedException();
    } else {
      request['userId'] = result.data.userId;
      request['deviceId'] = result.data.deviceId;
      return true;
    }
  }
}
