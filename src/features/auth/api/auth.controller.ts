import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Response,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { UserCreateModel } from '../../users/api/models/input/create-user.input.model';
import { LoginInputModel } from './models/input/login.input.model';
import { AuthService } from '../application/auth.service';
import { CodeConfirmationModel } from './models/input/code.confirmation.model';
import { EmailInputModel } from './models/input/email.input.model';
import { uuid } from 'uuidv4';
import { AuthBearerGuard } from '../../../infrastructure/guards/auth.bearer.guard';
import { UsersQueryRepository } from '../../users/infrastructure/users.query-repository';
import { UsersRepository } from '../../users/infrastructure/users.repository';
import { SecurityService } from '../../security/application/security.service';
import { AuthRefreshTokenGuard } from '../../../infrastructure/guards/auth.refresh-token-guard';

@Controller('auth')
export class AuthController {
  constructor(
    protected authService: AuthService,
    protected usersQueryRepository: UsersQueryRepository,
    protected usersRepository: UsersRepository,
    protected securityService: SecurityService,
  ) {}
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

  @UseGuards(AuthBearerGuard)
  @Get('me')
  async aboutMe(@Req() req) {
    const result = await this.usersQueryRepository.getAboutMe(req.userId);

    if (result.hasError()) {
      if (result.code === 400) {
        throw new BadRequestException(result.extensions);
      }
    }

    return result.data;
  }

  // @UseGuards(LocalAuthGuard)
  @HttpCode(200)
  @Post('login')
  async login(
    @Body() loginInput: LoginInputModel,
    @Response() res,
    @Req() req,
  ) {
    const resultCheckCredentials =
      await this.authService.checkCredentials(loginInput);

    if (resultCheckCredentials.hasError()) {
      if (resultCheckCredentials.code === 401) {
        throw new UnauthorizedException();
      }
    }

    const user = await this.usersRepository.findByLoginOrEmail(
      loginInput.loginOrEmail,
    );

    //сначала сделаем аксесс токен
    const accessToken = await this.authService.createAccessToken(user.id);

    //создадим deviceId

    const newDeviceId = uuid();

    //теперь создадим рефреш токен
    const { refreshToken } = await this.authService.createRefreshToken(
      user.id,
      newDeviceId,
    );

    console.log('new refreshToken', refreshToken);

    const fullPayLoadRefreshToken =
      await this.authService.decodeToken(refreshToken);

    const resultCreated = await this.securityService.createSession(
      fullPayLoadRefreshToken,
      req.headers['user-agent'] ?? 'string',
      req.ip,
    );

    if (resultCreated.hasError()) {
      if (resultCreated.code === 400) {
        throw new BadRequestException(resultCreated.extensions);
      }
    }

    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });
    res.send(accessToken);
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

  @UseGuards(AuthRefreshTokenGuard)
  @HttpCode(200)
  @Post('refresh-token')
  async refreshToken(@Req() req, @Response() res) {
    const result = await this.authService.returnNewTokens(
      req.cookies.refreshToken,
      req.userId,
    );

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: true,
    });
    res.send(result.newAccessToken);
  }

  @UseGuards(AuthRefreshTokenGuard)
  @HttpCode(200)
  @Post('logout')
  async logout(@Req() req) {
    const result = await this.securityService.dropCurrentSession(
      req.userId,
      req.deviceId,
    );
  }
}
