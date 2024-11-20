import { EnvironmentVariable } from '../app-settings';
import { IsString } from '@nestjs/class-validator';

export class DatabaseSettings {
  constructor(private environmentVariables: EnvironmentVariable) {}
  @IsString()
  MONGO_CONNECTION_URI: string = this.environmentVariables.MONGO_CONNECTION_URI;
  @IsString()
  MONGO_CONNECTION_URI_FOR_TESTS: string =
    this.environmentVariables.MONGO_CONNECTION_URI_FOR_TESTS;
  @IsString()
  POSTGRES_DB_NAME: string = this.environmentVariables.POSTGRES_DB_NAME;
  @IsString()
  POSTGRES_DB_NAME_TEST: string =
    this.environmentVariables.POSTGRES_DB_NAME_TEST;
}
