import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { UsersService } from '../../features/users/application/users.service';

@Injectable()
export class AuthBasicGuard implements CanActivate {
  constructor(protected usersService: UsersService) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const ADMIN_AUTH_BASE64 = 'Basic YWRtaW46cXdlcnR5';
    if (!request.headers.authorization) {
      throw new UnauthorizedException();
    }
    if (request.headers.authorization !== ADMIN_AUTH_BASE64) {
      throw new UnauthorizedException();
    }
    return true;
  }
}
