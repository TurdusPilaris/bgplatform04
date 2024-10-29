import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from '../../features/userAccaunts/users/application/users.service';
import { AuthService } from '../../features/userAccaunts/auth/application/auth.service';

@Injectable()
export class GetOptionalUserGard implements CanActivate {
  constructor(
    protected usersService: UsersService,
    protected authService: AuthService,
  ) {}
  async canActivate(context: ExecutionContext) {
    // : boolean | Promise<boolean> | Observable<boolean>
    const request: Request = context.switchToHttp().getRequest();

    if (!request.headers.authorization) {
      request['userId'] = null;
      return true;
    }

    const result = await this.authService.checkAccessToken(
      request.headers.authorization,
    );

    if (result.hasError()) {
      request['userId'] = null;
      return true;
    } else {
    }
    request['userId'] = result.data;
    return true;
  }
}
