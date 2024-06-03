enum Environments {
  DEVELOPMENT = 'DEVELOPMENT',
  STAGING = 'STAGING',
  PRODUCTION = 'PRODUCTION',
  TESTING = 'TESTING',
}
import dotenv from 'dotenv';
dotenv.config();
export type EnvironmentVariable = { [key: string]: string | undefined };

export type ConfigurationType = ReturnType<typeof getConfig>;

const getConfig = (
  environmentVariables: EnvironmentVariable,
  currentEnvironment: Environments,
) => {
  console.log({
    MONGO_CONNECTION_URI: environmentVariables.MONGO_CONNECTION_URI,
    MONGO_CONNECTION_URI_FOR_TESTS:
      environmentVariables.MONGO_CONNECTION_URI_FOR_TESTS,
  });
  console.log(currentEnvironment);
  return {
    apiSettings: {
      PORT: Number.parseInt(environmentVariables.PORT || '3000'),
      LOCAL_HOST: environmentVariables.LOCAL_HOST || 'http://localhost:3000',
      PUBLIC_FRIEND_FRONT_URL: environmentVariables.PUBLIC_FRIEND_FRONT_URL,
    },

    databaseSettings: {
      MONGO_CONNECTION_URI: environmentVariables.MONGO_CONNECTION_URI,
      MONGO_CONNECTION_URI_FOR_TESTS:
        environmentVariables.MONGO_CONNECTION_URI_FOR_TESTS,
    },
    authSettings: {
      PASSWORD_FOR_EMAIL: environmentVariables.PASSWORD_FOR_EMAIL,
      JWT_SECRET: environmentVariables.JWT_SECRET,
    },

    environmentSettings: {
      currentEnv: currentEnvironment,
      isProduction: currentEnvironment === Environments.PRODUCTION,
      isStaging: currentEnvironment === Environments.STAGING,
      isTesting: currentEnvironment === Environments.TESTING,
      isDevelopment: currentEnvironment === Environments.DEVELOPMENT,
    },
  };
};

export default () => {
  const environmentVariables = process.env;

  const currentEnvironment: Environments =
    environmentVariables.ENV as Environments;

  return getConfig(environmentVariables, currentEnvironment);
};
