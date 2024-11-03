import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../../features/user-accaunts/auth/application/auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super();
  }

  async validate(auth: string): Promise<any> {
    //old
    // if(!req.headers.authorization) {
    //   res.sendStatus(401);
    //   return;
    // }
    //
    // const result = await authService.checkAccessToken(req.headers.authorization);
    //
    // if(result.status === ResultStatus.Success){
    //   req.userId = result.data!.toString();
    //   return next();
    // }
    //
    // return res.sendStatus(401);
    const wasValidate = await this.authService.validateBasicUser(auth);
    if (!wasValidate) {
      throw new UnauthorizedException();
    }

    return wasValidate;
  }
}
