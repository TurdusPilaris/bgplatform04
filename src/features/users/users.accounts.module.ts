import { UsersController } from './api/users.controller';
import { UsersService } from './application/users.service';
import { Module } from '@nestjs/common';
import { UsersRepository } from './infrastructure/users.repository';
import { UsersQueryRepository } from './infrastructure/users.query-repository';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Configuration } from '../../settings/configuration';
import { DevicesController } from '../security/api/devices.controller';
import { AuthController } from '../auth/api/auth.controller';
import { SecurityService } from '../security/application/security.service';
import { SecurityRepository } from '../security/infrastucture/security.repository';
import { SecurityQueryRepository } from '../security/infrastucture/security.query.repository';
import { AuthService } from '../auth/application/auth.service';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: undefined,
      useFactory: (configService: ConfigService<Configuration, true>) => {
        const environmentSettings = configService.get('environmentSettings', {
          infer: true,
        });
        const databaseSettings = configService.get('databaseSettings', {
          infer: true,
        });
        const uri = environmentSettings.isTesting
          ? databaseSettings.MONGO_CONNECTION_URI_FOR_TESTS
          : databaseSettings.MONGO_CONNECTION_URI;

        return {
          uri: uri,
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [UsersController, DevicesController, AuthController],
  providers: [
    UsersService,
    UsersRepository,
    UsersQueryRepository,
    SecurityService,
    SecurityRepository,
    SecurityQueryRepository,
    AuthService,
  ],
  exports: [UsersService, SecurityService, AuthService],
})
export class UserAccountsModule {}
