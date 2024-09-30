import { EnvironmentVariable } from '../app-settings';
import { IsString } from '@nestjs/class-validator';

export class DatabaseSettings {
  constructor(private environmentVariables: EnvironmentVariable) {}
  @IsString()
  MONGO_CONNECTION_URI: string = this.environmentVariables.MONGO_CONNECTION_URI;
  MONGO_CONNECTION_URI_FOR_TESTS: string =
    this.environmentVariables.MONGO_CONNECTION_URI_FOR_TESTS;
}
