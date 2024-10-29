import { config } from 'dotenv';

config();
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BcryptService } from './base/adapters/bcrypt-service';
import { JwtService } from '@nestjs/jwt';
import { EmailRouter } from './base/email/email-router';
import { EmailAdapter } from './base/adapters/email-adapter';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration, {
  Configuration,
  validate,
} from './settings/configuration';

import { CqrsModule } from '@nestjs/cqrs';
import { ThrottlerModule } from '@nestjs/throttler';
import { BloggersPlatformModule } from './features/bloggers-platform/bloggers.platform.module';
import { UserAccountsModule } from './features/userAccaunts/users.accounts.module';
import { TestingModule } from './features/testing/testing.module';
const adapters = [EmailAdapter, EmailRouter, JwtService, BcryptService];

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 10000, limit: 5 }]),
    CqrsModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate: validate,
    }),
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
    UserAccountsModule,
    BloggersPlatformModule,
    TestingModule,
  ],
  providers: [...adapters],
})
export class AppModule {}
