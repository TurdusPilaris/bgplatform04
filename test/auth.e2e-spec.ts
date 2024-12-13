import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { applyAppSettings } from '../src/settings/apply-app-setting';

import { UserServiceMock } from './mock/user.service.mock';
import { BusinessService } from '../src/base/domain/business-service';
import { BusinessServiceMock } from './mock/business.service.mock';

import { TestingController } from '../src/features/testing/testing-controller';
import { UsersService } from '../src/features/user-accaunts/users/application/users.service';

import { userTestSeeder } from './utils/users/users.test.seedr';
import { authTestSeeder } from './utils/auth/auth.test.seedr';
import { UsersTorRepository } from '../src/features/user-accaunts/users/infrastructure/tor/users.tor.repository';
import { v4 } from 'uuid';
import { AuthTestManager } from './utils/auth/auth.test.manager';
import { UsersTestManager } from './utils/users/users.test.manager';

const CORRECT_ADMIN_AUTH_BASE64 = 'Basic YWRtaW46cXdlcnR5';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let authTestManager: AuthTestManager;
  let usersTestManager: UsersTestManager;
  let testingController: TestingController;
  let userRepository: UsersTorRepository;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(UsersService)
      .useClass(UserServiceMock)
      .overrideProvider(BusinessService)
      .useClass(BusinessServiceMock)
      .compile();

    testingController = moduleFixture.get(TestingController);
    await testingController.allDelete();
    app = moduleFixture.createNestApplication();

    applyAppSettings(app);
    await app.init();

    // Init userManager
    authTestManager = new AuthTestManager(app);
    usersTestManager = new UsersTestManager(app);
    userRepository = moduleFixture.get(UsersTorRepository);
  });

  beforeEach(async () => {
    await testingController.allDelete();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ auth login tests (POST) successful (200)', async () => {
    //create new user DTO
    const createModel = userTestSeeder.createUserDTO();

    //create real user
    await usersTestManager.createUser(CORRECT_ADMIN_AUTH_BASE64, createModel);

    //create login with real user
    const loginInputModel = authTestSeeder.createLoginInputModel(createModel);

    //send
    const resultReq = await authTestManager.login(loginInputModel);

    const requestBody = resultReq.body;
    expect(requestBody.accessToken).toBeDefined();

    // Check cookies in response
    const cookies: string = resultReq.headers['set-cookie'];
    if (Array.isArray(cookies)) {
      // If cookies are an array, check specific cookie content
      const hasSessionCookie = cookies.some((cookie) =>
        cookie.startsWith('refreshToken='),
      );
      expect(hasSessionCookie).toBe(true);
    } else if (typeof cookies === 'string') {
      // If cookies are a single string, check directly
      const hasSessionCookie = cookies.includes('refreshToken=');
      expect(hasSessionCookie).toBe(true);
    } else {
      throw new Error('Unexpected format for cookies');
    }
  });

  it('/ auth login tests (POST) unauthirization (401)', async () => {
    //create new user DTO
    const createModel = userTestSeeder.createUserDTO();

    //create login without real user
    const loginInputModel = authTestSeeder.createLoginInputModel(createModel);

    //send
    await authTestManager.loginWithoutUser(loginInputModel);
  });

  it('/ auth registration tests (POST) successful (204)', async () => {
    //create new user DTO
    const createModel = userTestSeeder.createUserDTO();

    //send
    await authTestManager.registration(createModel);
  });
  it('/ auth registration tests (POST) bad request (400)', async () => {
    //create new user DTO
    const createModel = userTestSeeder.createUserDTO();

    //create real user
    await usersTestManager.createUser(CORRECT_ADMIN_AUTH_BASE64, createModel);

    //send
    const resultReq = await authTestManager.registrationBadRequest(createModel);
    const requestBody = resultReq.body;
    expect(requestBody.errorsMessages).toBeDefined();
    expect(requestBody.errorsMessages[0].field).toEqual('login');
  });
  it('/ auth password recovery tests (POST) successful (204)', async () => {
    //create email DTO
    const createModel = authTestSeeder.createEmailInputModel();

    //send
    await authTestManager.passwordRecovery(createModel);
  });
  it('/ auth password recovery tests (POST) bad request (400)', async () => {
    //create email DTO
    const createModel = authTestSeeder.createBadEmailInputModel();

    //send
    await authTestManager.passwordRecoveryBad(createModel);
  });

  it('/ auth confirm  new password recovery tests (POST) successful (204)', async () => {
    //create new user DTO
    const createModel = userTestSeeder.createUserDTO();

    //create real user
    const result = await usersTestManager.createUser(
      CORRECT_ADMIN_AUTH_BASE64,
      createModel,
    );
    const user = await userRepository.findById(result.body.id);

    const newPasswordRecoveryInputModel =
      authTestSeeder.createNewPasswordRecoveryInputModel(user.confirmationCode);

    //send
    await authTestManager.newPassword(newPasswordRecoveryInputModel);
  });

  it('/ auth confirm  new password recovery tests (POST) bad request (400)', async () => {
    const newPasswordRecoveryInputModel =
      authTestSeeder.createNewPasswordRecoveryInputModel(v4());

    //send
    await authTestManager.newPasswordBad(newPasswordRecoveryInputModel);
  });

  it('/ auth registration confirmation tests (POST) successful (204)', async () => {
    //create new user DTO
    const createModel = userTestSeeder.createUserDTO();

    //create real user
    const result = await usersTestManager.createUser(
      CORRECT_ADMIN_AUTH_BASE64,
      createModel,
    );
    const user = await userRepository.findById(result.body.id);

    const newPasswordRecoveryInputModel =
      authTestSeeder.createCodeConfirmationModel(user.confirmationCode);

    //send
    await authTestManager.registrationConfirmation(
      newPasswordRecoveryInputModel,
    );
  });

  it('/ auth registration confirmation tests (POST) bad request confirmation code is incorrect(400)', async () => {
    //create new user DTO
    const newPasswordRecoveryInputModel =
      authTestSeeder.createCodeConfirmationModel(v4());

    //send
    await authTestManager.registrationConfirmationBad(
      newPasswordRecoveryInputModel,
    );
  });

  it('/ auth registration confirmation tests (POST) bad request confirmation code is already been applied (400)', async () => {
    //create new user DTO
    const createModel = userTestSeeder.createUserDTO();

    //create real user
    const result = await usersTestManager.createUser(
      CORRECT_ADMIN_AUTH_BASE64,
      createModel,
    );
    const user = await userRepository.findById(result.body.id);

    const newPasswordRecoveryInputModel =
      authTestSeeder.createCodeConfirmationModel(user.confirmationCode);

    //send ok
    await authTestManager.registrationConfirmation(
      newPasswordRecoveryInputModel,
    );
    await authTestManager.registrationConfirmationBad(
      newPasswordRecoveryInputModel,
    );
  });
  it('/ auth registration confirmation tests (POST) bad request confirmation code is already been applied (400)', async () => {
    //create new user DTO
    const createModel = userTestSeeder.createUserDTO();

    //create real user
    const result = await usersTestManager.createUser(
      CORRECT_ADMIN_AUTH_BASE64,
      createModel,
    );
    const user = await userRepository.findById(result.body.id);

    const newPasswordRecoveryInputModel =
      authTestSeeder.createCodeConfirmationModel(user.confirmationCode);

    //send ok
    await authTestManager.registrationConfirmation(
      newPasswordRecoveryInputModel,
    );
    await authTestManager.registrationConfirmationBad(
      newPasswordRecoveryInputModel,
    );
  });
});
