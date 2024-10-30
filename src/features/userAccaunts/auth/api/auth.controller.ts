import {
  Body,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UserCreateModel } from '../../users/api/models/input/create-user.input.model';
import { LoginInputModel } from './models/input/login.input.model';
import { AuthService } from '../application/auth.service';
import { CodeConfirmationModel } from './models/input/code.confirmation.model';
import { EmailInputModel } from './models/input/email.input.model';
import { uuid } from 'uuidv4';
import { UsersQueryRepository } from '../../users/infrastructure/users.query-repository';
import { UsersRepository } from '../../users/infrastructure/users.repository';
import { SecurityService } from '../../security/application/security.service';
import { ThrottlerGuard } from '@nestjs/throttler';
import { CommandBus } from '@nestjs/cqrs';
import { CreateSessionCommand } from '../../security/application/use-cases/create-session-use-case';
import { RegisterUserCommand } from '../application/use-cases/register-user-use-case';
import { RegistrationConfirmationCommand } from '../application/use-cases/registration-confirmation-use-case';
import { AuthBearerGuard } from '../../../../infrastructure/guards/auth.bearer.guard';
import { AuthRefreshTokenGuard } from '../../../../infrastructure/guards/auth.refresh-token-guard';
import { ErrorProcessor } from '../../../../base/models/errorProcessor';
import { Request, Response } from 'express';
import { AboutMeOutputModel } from './models/output/about-me-output-model';

@Controller('auth')
export class AuthController {
  constructor(
    private commandBus: CommandBus,
    protected authService: AuthService,
    protected usersQueryRepository: UsersQueryRepository,
    protected usersRepository: UsersRepository,
    protected securityService: SecurityService,
  ) {}

  @UseGuards(AuthBearerGuard)
  @Get('me')
  async aboutMe(@Req() req: Request): Promise<AboutMeOutputModel> {
    const user = await this.usersRepository.findById(req.userId);

    if (!user) {
      throw new NotFoundException();
    }

    return await this.usersQueryRepository.getAboutMe(req.userId);
  }

  @UseGuards(ThrottlerGuard)
  @HttpCode(204)
  @Post('registration')
  async registration(@Body() createInputUser: UserCreateModel) {
    const result = await this.commandBus.execute(
      new RegisterUserCommand(createInputUser),
    );
    if (result.hasError()) {
      new ErrorProcessor(result).errorHandling();
    }
  }

  @UseGuards(ThrottlerGuard)
  @HttpCode(200)
  @Post('login')
  async login(
    @Body() loginInput: LoginInputModel,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const resultCheckCredentials =
      await this.authService.checkCredentials(loginInput);

    if (resultCheckCredentials.hasError()) {
      new ErrorProcessor(resultCheckCredentials).errorHandling();
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

    const fullPayLoadRefreshToken =
      await this.authService.decodeToken(refreshToken);

    const resultCreated = await this.commandBus.execute(
      new CreateSessionCommand(
        fullPayLoadRefreshToken,
        req.headers['user-agent'] ?? 'string',
        req.ip,
      ),
    );

    if (resultCreated.hasError()) {
      new ErrorProcessor(resultCreated).errorHandling();
    }

    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });
    res.send(accessToken);
  }

  @UseGuards(ThrottlerGuard)
  @HttpCode(204)
  @Post('registration-confirmation')
  async registrationConfirmation(@Body() inputCode: CodeConfirmationModel) {
    const result = await this.commandBus.execute(
      new RegistrationConfirmationCommand(inputCode),
    );
    if (result.hasError()) {
      new ErrorProcessor(result).errorHandling();
    }
  }

  @UseGuards(ThrottlerGuard)
  @HttpCode(204)
  @Post('registration-email-resending')
  async registrationEmailResending(@Body() inputEmail: EmailInputModel) {
    const result = await this.authService.resendingEmail(inputEmail.email);

    if (result.hasError()) {
      new ErrorProcessor(result).errorHandling();
    }
  }

  @HttpCode(204)
  @Post('password-recovery')
  async passwordRecovery(@Body() inputEmail: EmailInputModel) {
    const result = await this.authService.recoveryPasswordSendCode(
      inputEmail.email,
    );

    if (result.hasError()) {
      new ErrorProcessor(result).errorHandling();
    }
  }

  @UseGuards(AuthRefreshTokenGuard)
  @HttpCode(200)
  @Post('refresh-token')
  async refreshToken(@Req() req: Request, @Res() res: Response) {
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
  @HttpCode(204)
  @Post('logout')
  async logout(@Req() req: Request) {
    await this.securityService.dropCurrentSession(req.userId, req.deviceId);
  }
}
