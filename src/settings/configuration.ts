import { AuthSettings } from './env/auth-settings';

export enum Environments {
  DEVELOPMENT = 'DEVELOPMENT',
  STAGING = 'STAGING',
  PRODUCTION = 'PRODUCTION',
  TESTING = 'TESTING',
}

import { ValidateNested, validateSync } from 'class-validator';
import { ApiSettings } from './env/api-settings';
import { DatabaseSettings } from './env/database-settings';
import { EnvironmentSettings } from './env/env-settings';
import { EnvironmentVariable } from './app-settings';

export class Configuration {
  @ValidateNested()
  apiSettings: ApiSettings;
  @ValidateNested()
  databaseSettings: DatabaseSettings;
  // Другие настройки...
  @ValidateNested()
  environmentSettings: EnvironmentSettings;
  @ValidateNested()
  authSettings: AuthSettings;

  private constructor(configuration: Configuration) {
    Object.assign(this, configuration);
  }

  static createConfig(
    environmentVariables: Record<string, string>,
    // environmentVariables: any,
  ): Configuration {
    return new this({
      apiSettings: new ApiSettings(environmentVariables),
      databaseSettings: new DatabaseSettings(environmentVariables),
      // environmentSettings: new EnvironmentSettings(
      //   environmentVariables as unknown as EnvironmentsTypes,
      // ),
      environmentSettings: new EnvironmentSettings(environmentVariables),
      authSettings: new AuthSettings(environmentVariables),
    });
  }
}

export function validate(environmentVariables: Record<string, string>) {
  const config = Configuration.createConfig(environmentVariables);

  const errors = validateSync(config, { skipMissingProperties: false });
  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return config;
}

export default () => {
  const environmentVariables = process.env as EnvironmentVariable;
  return Configuration.createConfig(environmentVariables);
};
