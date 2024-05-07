import { config } from 'dotenv';

config();

// export type EnvironmentVariable = { [key: string]: string | undefined };
export type EnvironmentVariable = { [key: string]: string | undefined };
export type EnvironmentsTypes =
  | 'DEVELOPMENT'
  | 'STAGING'
  | 'PRODUCTION'
  | 'TESTING';
export const Environments = ['DEVELOPMENT', 'STAGING', 'PRODUCTION', 'TESTING'];

export class EnvironmentSettings {
  constructor(private env: EnvironmentsTypes) {}

  getEnv() {
    return this.env;
  }

  isProduction() {
    return this.env === 'PRODUCTION';
  }

  isStaging() {
    return this.env === 'STAGING';
  }

  isDevelopment() {
    return this.env === 'DEVELOPMENT';
  }

  isTesting() {
    return this.env === 'TESTING';
  }
}

class AppSettings {
  constructor(
    public env: EnvironmentSettings,
    public api: APISettings,
  ) {}
}

class APISettings {
  // Application
  public readonly APP_PORT: number;

  // Database
  public readonly MONGO_CONNECTION_URI: string;

  constructor(private readonly envVariables: EnvironmentVariable) {
    // Application
    // this.APP_PORT = this.getNumberOrDefault(envVariables.APP_PORT, 7840);

    this.APP_PORT = this.getNumberOrDefault('3000', 3000);

    // Database
    this.MONGO_CONNECTION_URI =
      envVariables.MONGO_CONNECTION_URI ?? 'mongodb://localhost/nest';
  }

  private getNumberOrDefault(value: string, defaultValue: number): number {
    const parsedValue = Number(value);

    if (isNaN(parsedValue)) {
      return defaultValue;
    }

    return parsedValue;
  }
}

const env = new EnvironmentSettings('DEVELOPMENT' as EnvironmentsTypes);
// );
//   (Environments.includes(process.env.ENV?.trim())
//     ? process.env.ENV.trim()
//     : 'DEVELOPMENT') as EnvironmentsTypes,
// );
// const env = new EnvironmentSettings(
//   (Environments.includes(process.env.ENV?.trim())
//     ? process.env.ENV.trim()
//     : 'DEVELOPMENT') as EnvironmentsTypes,
// );

const api = new APISettings(process.env);
export const appSettings = new AppSettings(env, api);
