import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { applyAppSettings } from '../src/settings/apply-app-setting';
import { UserServiceMock } from './mock/user.service.mock';
import { userTestSeeder } from './utils/users/users.test.seedr';
import { BusinessService } from '../src/base/domain/business-service';
import { BusinessServiceMock } from './mock/business.service.mock';

// import mongoose from 'mongoose';
import { TestingController } from '../src/features/testing/testing-controller';
import { UsersService } from '../src/features/user-accaunts/users/application/users.service';
import { UsersTestManager } from './utils/users/users.test.manager';

// const TEST_ADMIN_CREDENTIALS = {
//   login: 'test',
//   password: 'qwerty',
// };

const CORRECT_ADMIN_AUTH_BASE64 = 'Basic YWRtaW46cXdlcnR5';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let usersTestManger: UsersTestManager;
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
    usersTestManger = new UsersTestManager(app);

    // const loginResult = await userTestManger.login(
    //   TEST_ADMIN_CREDENTIALS.login,
    //   TEST_ADMIN_CREDENTIALS.password,
    // );

    // Работа с состоянием
    // expect.setState({
    //   adminTokens: loginResult,
    // });
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ create user tests (POST) Bad Request (400)', async () => {
    expect(1).toBe(1);
    //   // Work with state
    //   // const { adminTokens } = expect.getState();
    //
    //   const createModel = userTestSeeder.createUserDTO();
    //
    //   await usersTestManger.createUserBadRequset(
    //     CORRECT_ADMIN_AUTH_BASE64,
    //     createModel,
    //   );
  });
});
