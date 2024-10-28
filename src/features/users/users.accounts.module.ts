import { UsersController } from './api/users.controller';
import { UsersService } from './application/users.service';
import { Module } from '@nestjs/common';
import { UsersRepository } from './infrastructure/users.repository';
import { UsersQueryRepository } from './infrastructure/users.query-repository';
import { MongooseModule } from '@nestjs/mongoose';
import { DevicesController } from '../security/api/devices.controller';
import { AuthController } from '../auth/api/auth.controller';
import { SecurityService } from '../security/application/security.service';
import { SecurityRepository } from '../security/infrastucture/security.repository';
import { SecurityQueryRepository } from '../security/infrastucture/security.query.repository';
import { AuthService } from '../auth/application/auth.service';
import { CreateSessionUseCase } from '../security/application/use-cases/create-session-use-case';
import { UpdateSessionUseCase } from '../security/application/use-cases/update-session-use-case';
import { RegisterUserUseCase } from '../auth/application/use-cases/register-user-use-case';
import { RegistrationConfirmationUseCase } from '../auth/application/use-cases/registration-confirmation-use-case';
import { User, UserSchema } from './domain/entities/user.entity';
import {
  DeviceAuthSession,
  DeviceAuthSessionSchema,
} from '../security/domain/deviceAuthSession.entity';
import { BcryptService } from '../../base/adapters/bcrypt-service';
import { BusinessService } from '../../base/domain/business-service';
import { JwtService } from '@nestjs/jwt';
import { EmailAdapter } from '../../base/adapters/email-adapter';
import { EmailRouter } from '../../base/email/email-router';
import { CqrsModule } from '@nestjs/cqrs';

const useCasesForSecurity = [CreateSessionUseCase, UpdateSessionUseCase];
const useCasesForAuth = [RegisterUserUseCase, RegistrationConfirmationUseCase];
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: DeviceAuthSession.name, schema: DeviceAuthSessionSchema },
    ]),
    CqrsModule,
  ],
  controllers: [UsersController, DevicesController, AuthController],
  providers: [
    ...useCasesForSecurity,
    ...useCasesForAuth,
    UsersService,
    UsersRepository,
    UsersQueryRepository,
    SecurityService,
    SecurityRepository,
    SecurityQueryRepository,
    AuthService,
    BcryptService,
    BusinessService,
    JwtService,
    EmailAdapter,
    EmailRouter,
  ],
  exports: [UsersService, SecurityService, AuthService, UsersRepository],
})
export class UserAccountsModule {}
