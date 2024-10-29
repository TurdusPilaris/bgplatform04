import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { UsersService } from '../../features/userAccaunts/users/application/users.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(protected usersService: UsersService) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    //401
    // throw new UnauthorizedException();
    return true;
  }
}
