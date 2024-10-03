import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Res,
  Response,
  UnauthorizedException,
} from '@nestjs/common';
import { UserCreateModel } from '../../users/api/models/input/create-user.input.model';
import { LoginInputModel } from './models/input/login.input.model';
import { AuthService } from '../application/auth.service';
import { CodeConfirmationModel } from './models/input/code.confirmation.model';
import { EmailInputModel } from './models/input/email.input.model';
import { uuid } from 'uuidv4';

@Controller('auth')
export class AuthController {
  constructor(protected authService: AuthService) {}
  @HttpCode(204)
  @Post('registration')
  async registration(@Body() createInputUser: UserCreateModel) {
    const result = await this.authService.registerUser(createInputUser);
    if (result.hasError()) {
      if (result.code === 400) {
        throw new BadRequestException(result.extensions);
      }
    }
  }

  // @UseGuards(LocalAuthGuard)
  @Get('me')
  async aboutMe() {}

  // @UseGuards(LocalAuthGuard)
  @HttpCode(200)
  @Post('login')
  async login(@Body() loginInput: LoginInputModel, @Response() res) {
    const resultCheckCredentials =
      await this.authService.checkCredentials(loginInput);

    if (resultCheckCredentials.hasError()) {
      if (resultCheckCredentials.code === 401) {
        throw new UnauthorizedException();
      }
    }

    //сначала сделаем аксесс токен
    const accessToken = await this.authService.getTokenForUser(
      loginInput.loginOrEmail,
    );

    // return accessToken;

    //теперь создадим рефреш токен
    const { refreshToken, userId, deviceId } =
      await this.authService.getRefreshTokenForUser(loginInput.loginOrEmail);

    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });
    res.send({ accessToken: accessToken });

    //перед тем как сделать рефреш токен создадим новую сессию id

    //
    // if (result) {
    //
    //   const user = await this.usersQueryRepository.findByLoginOrEmail(req.body.loginOrEmail);
    //
    //   const payLoadAccessToken: PayloadTokenType = {userId: user!._id};
    //   const token = await this.jwtService.createToken(payLoadAccessToken, SETTING.AC_TIME, SETTING.JWT_SECRET);
    //
    //   const newDeviceId = uuidv4();
    //
    //   const payLoadRefreshToken: PayloadTokenType = {userId: user!._id, deviceId: newDeviceId};
    //   const refreshToken = await this.jwtService.createToken(payLoadRefreshToken, SETTING.AC_REFRESH_TIME, SETTING.JWT_REFRESH_SECRET);
    //
    //   const fullPayLoadRefreshToken = await this.jwtService.decodeToken(refreshToken);
    //   const resultCreated = await this.securityService.createSession(fullPayLoadRefreshToken, req.headers['user-agent']??'string', req.ip);
    //
    //   if (resultCreated.status === ResultStatus.BadRequest) {
    //     res.status(400).send({errorsMessages: [{message: resultCreated.errorMessage, field: resultCreated.errorField}]});
    //     return;
    //   } else if(resultCreated.status === ResultStatus.InternalServerError) {
    //     res.status(500).send({errorsMessages: [{message: resultCreated.errorMessage, field: resultCreated.errorField}]});
    //     return;
    //   }
    //   res.cookie('refreshToken', refreshToken, {httpOnly: true, secure: true,});
    //   res.status(200).send({"accessToken":token});
    //
    // } else {
    //   res.sendStatus(401);
    // }
  }

  @HttpCode(204)
  @Post('registration-confirmation')
  async registrationConfirmation(@Body() inputCode: CodeConfirmationModel) {
    const result = await this.authService.registrationConfirmation(inputCode);

    if (result.hasError()) {
      if (result.code === 400) {
        throw new BadRequestException(result.extensions);
      }
    }
  }

  @HttpCode(204)
  @Post('registration-email-resending')
  async registrationEmailResending(@Body() inputEmail: EmailInputModel) {
    const result = await this.authService.resendingEmail(inputEmail.email);

    if (result.hasError()) {
      if (result.code === 400) {
        throw new BadRequestException(result.extensions);
      }
    }
  }

  // @HttpCode(204)
  // @Post('refresh-token')
  // async refreshToken(@Body() inputEmail: EmailInputModel) {
  //   const result = await this.authService.resendingEmail(inputEmail.email);
  //
  //   if (result.hasError()) {
  //     if (result.code === 400) {
  //       throw new BadRequestException(result.extensions);
  //     }
  //   }
  // }

  @HttpCode(204)
  @Post('password-recovery')
  async passwordRecovery(@Body() inputEmail: EmailInputModel) {
    const result = await this.authService.recoveryPasswordSendCode(
      inputEmail.email,
    );

    if (result.hasError()) {
      if (result.code === 400) {
        throw new BadRequestException(result.extensions);
      }
    }
  }
}
