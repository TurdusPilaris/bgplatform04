import { EnvironmentVariable } from '../app-settings';
import { IsNumber } from 'class-validator';
import { IsString } from '@nestjs/class-validator';

export class ApiSettings {
  constructor(private environmentVariables: EnvironmentVariable) {}
  @IsNumber()
  PORT: number = Number.parseInt(this.environmentVariables.PORT || '3000');
  @IsString()
  LOCAL_HOST: string =
    this.environmentVariables.LOCAL_HOST || 'http://localhost:3000';
}
