import { EnvironmentVariable } from '../app-settings';
import { IsNumber } from 'class-validator';

export class ApiSettings {
  constructor(private environmentVariables: EnvironmentVariable) {}
  @IsNumber()
  PORT: number = Number.parseInt(this.environmentVariables.PORT || '3000');
  LOCAL_HOST: string =
    this.environmentVariables.LOCAL_HOST || 'http://localhost:3000';
  PUBLIC_FRIEND_FRONT_URL: string =
    this.environmentVariables.PUBLIC_FRIEND_FRONT_URL;
}
