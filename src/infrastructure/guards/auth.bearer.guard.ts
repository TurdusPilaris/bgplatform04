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
export class AuthBearerGuard implements CanActivate {
  constructor(
    protected usersService: UsersService,
    protected authService: AuthService,
  ) {}
  async canActivate(context: ExecutionContext) {
    // : boolean | Promise<boolean> | Observable<boolean>
    const request: Request = context.switchToHttp().getRequest();

    if (!request.headers.authorization) {
      throw new UnauthorizedException();
    }

    const result = await this.authService.checkAccessToken(
      request.headers.authorization,
    );

    if (result.hasError()) {
      throw new UnauthorizedException();
    } else {
      request['userId'] = result.data;
      return true;
    }
  }
}
