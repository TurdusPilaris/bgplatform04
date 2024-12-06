import { UsersController } from './users/api/users.controller';
import { UsersService } from './users/application/users.service';
import { Module } from '@nestjs/common';
import { UsersRepository } from './users/infrastructure/mongo/users.repository';
import { UsersQueryRepository } from './users/infrastructure/mongo/users.query-repository';
import { MongooseModule } from '@nestjs/mongoose';
import { DevicesController } from './security/api/devices.controller';
import { AuthController } from './auth/api/auth.controller';
import { SecurityService } from './security/application/security.service';
import { SecurityRepository } from './security/infrastucture/mongo/security.repository';
import { SecurityQueryRepository } from './security/infrastucture/mongo/security.query.repository';
import { AuthService } from './auth/application/auth.service';
import { CreateSessionUseCase } from './security/application/use-cases/create-session-use-case';
import { UpdateSessionUseCase } from './security/application/use-cases/update-session-use-case';
import { RegisterUserUseCase } from './auth/application/use-cases/register-user-use-case';
import { RegistrationConfirmationUseCase } from './auth/application/use-cases/registration-confirmation-use-case';
import { User, UserSchema } from './users/domain/entities/user.entity';
import {
  DeviceAuthSession,
  DeviceAuthSessionSchema,
} from './security/domain/deviceAuthSession.entity';
import { BcryptService } from '../../base/adapters/bcrypt-service';
import { BusinessService } from '../../base/domain/business-service';
import { JwtService } from '@nestjs/jwt';
import { EmailAdapter } from '../../base/adapters/email-adapter';
import { EmailRouter } from '../../base/email/email-router';
import { CqrsModule } from '@nestjs/cqrs';
import { LoginUseCase } from './auth/application/use-cases/login-use-case';
import { SecuritySqlRepository } from './security/infrastucture/sql/security.sql.repository';
import { UsersSqlQueryRepository } from './users/infrastructure/sql/users.sql.query-repositories';
import { UsersSqlRepository } from './users/infrastructure/sql/users.sql.repositories';
import { SecuritySqlQueryRepository } from './security/infrastucture/sql/security.sql.query-repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserTor } from './users/domain/entities/user.sql.entity';
import { Sessions } from './security/domain/session.sql';
import { UsersTorRepository } from './users/infrastructure/tor/users.tor.repository';
import { UsersTorQueryRepository } from './users/infrastructure/tor/users.tor.query-repositories';
import { SecurityTorRepository } from './security/infrastucture/tor/security.tor.repository';
import { RecoveryPasswordSendUseCase } from './auth/application/use-cases/recovery-password-send-use-case';
import { RegistrationEmailResendingUseCase } from './auth/application/use-cases/registration-email-resending-use-case';
import { DeleteSessionUseCase } from './security/application/use-cases/delete-session-use-case';
import { DeleteSessionByDeviceIdUseCase } from './security/application/use-cases/delete-session-by-device-id-use-case';
import { LogoutUseCase } from './auth/application/use-cases/logout-use-case';
import { NewPasswordUseCase } from './auth/application/use-cases/new-password-use-case';
import { SecurityTorQueryRepository } from './security/infrastucture/tor/security.tor.query-repository';

const useCasesForSecurity = [
  CreateSessionUseCase,
  UpdateSessionUseCase,
  DeleteSessionUseCase,
  DeleteSessionByDeviceIdUseCase,
  LogoutUseCase,
];
const useCasesForAuth = [
  RegisterUserUseCase,
  RegistrationConfirmationUseCase,
  LoginUseCase,
  RecoveryPasswordSendUseCase,
  RegistrationEmailResendingUseCase,
  NewPasswordUseCase,
];
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: DeviceAuthSession.name, schema: DeviceAuthSessionSchema },
    ]),
    CqrsModule,
    TypeOrmModule.forFeature([UserTor, Sessions]),
  ],

  controllers: [UsersController, DevicesController, AuthController],
  providers: [
    ...useCasesForSecurity,
    ...useCasesForAuth,
    UsersService,
    UsersRepository,
    UsersQueryRepository,
    UsersSqlRepository,
    UsersSqlQueryRepository,
    UsersTorQueryRepository,
    SecurityService,
    SecurityRepository,
    SecurityQueryRepository,
    SecuritySqlRepository,
    SecuritySqlQueryRepository,
    SecurityTorQueryRepository,
    SecurityTorRepository,
    AuthService,
    BcryptService,
    BusinessService,
    JwtService,
    EmailAdapter,
    EmailRouter,
    UsersTorRepository,
    // { useClass, name: 'IUsersRepository' },
  ],
  exports: [
    UsersService,
    SecurityService,
    AuthService,
    UsersRepository,
    UsersSqlRepository,
    UsersTorRepository,
  ],
})
export class UserAccountsModule {}
