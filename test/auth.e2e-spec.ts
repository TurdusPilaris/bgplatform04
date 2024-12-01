import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { applyAppSettings } from '../src/settings/apply-app-setting';
import { UsersTestManager } from './utils/users/users-test-manager';

import { UserServiceMock } from './mock/user.service.mock';
import { BusinessService } from '../src/base/domain/business-service';
import { BusinessServiceMock } from './mock/business.service.mock';

import { TestingController } from '../src/features/testing/testing-controller';
import { UsersService } from '../src/features/user-accaunts/users/application/users.service';
import { AuthTestManager } from './utils/auth/auth-test-manager';
import { userTestSeeder } from './utils/users/users.test.seedr';
import { authTestSeeder } from './utils/auth/auth.test.seedr';
import { SecurityService } from '../src/features/user-accaunts/security/application/security.service';

const CORRECT_ADMIN_AUTH_BASE64 = 'Basic YWRtaW46cXdlcnR5';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let authTestManager: AuthTestManager;
  let usersTestManager: UsersTestManager;
  let testingController: TestingController;

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
});
