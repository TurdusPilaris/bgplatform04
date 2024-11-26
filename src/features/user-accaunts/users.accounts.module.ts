import { UsersController } from './users/api/users.controller';
import { UsersService } from './users/application/users.service';
import { Module } from '@nestjs/common';
import { UsersRepository } from './users/infrastructure/users.repository';
import { UsersQueryRepository } from './users/infrastructure/users.query-repository';
import { MongooseModule } from '@nestjs/mongoose';
import { DevicesController } from './security/api/devices.controller';
import { AuthController } from './auth/api/auth.controller';
import { SecurityService } from './security/application/security.service';
import { SecurityRepository } from './security/infrastucture/security.repository';
import { SecurityQueryRepository } from './security/infrastucture/security.query.repository';
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
import { SecuritySqlRepository } from './security/infrastucture/security.sql.repository';
import { UsersSqlQueryRepository } from './users/infrastructure/users.sql.query-repositories';
import { UsersSqlRepository } from './users/infrastructure/users.sql.repositories';
import { SecuritySqlQueryRepository } from './security/infrastucture/security.sql.query-repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from './users/domain/entities/user.sql.entity';
import { Sessions } from './security/domain/session.sql';

const useCasesForSecurity = [CreateSessionUseCase, UpdateSessionUseCase];
const useCasesForAuth = [
  RegisterUserUseCase,
  RegistrationConfirmationUseCase,
  LoginUseCase,
];
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: DeviceAuthSession.name, schema: DeviceAuthSessionSchema },
    ]),
    CqrsModule,
    TypeOrmModule.forFeature([Users, Sessions]),
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
    SecurityService,
    SecurityRepository,
    SecurityQueryRepository,
    SecuritySqlRepository,
    SecuritySqlQueryRepository,
    AuthService,
    BcryptService,
    BusinessService,
    JwtService,
    EmailAdapter,
    EmailRouter,
  ],
  exports: [
    UsersService,
    SecurityService,
    AuthService,
    UsersRepository,
    UsersSqlRepository,
  ],
})
export class UserAccountsModule {}