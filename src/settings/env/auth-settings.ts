import { EnvironmentVariable } from '../app-settings';
import { IsString } from '@nestjs/class-validator';

export class AuthSettings {
  constructor(private environmentVariables: EnvironmentVariable) {}
  @IsString()
  PASSWORD_FOR_EMAIL: string = this.environmentVariables.PASSWORD_FOR_EMAIL;
  JWT_SECRET: string = this.environmentVariables.JWT_SECRET;
}
