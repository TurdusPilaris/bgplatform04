import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { applyAppSettings } from '../src/settings/apply-app-setting';

import { UserServiceMock } from './mock/user.service.mock';
import { userTestSeeder } from './utils/users/users.test.seedr';
import { BusinessService } from '../src/base/domain/business-service';
import { BusinessServiceMock } from './mock/business.service.mock';

import { TestingController } from '../src/features/testing/testing-controller';
import { UsersService } from '../src/features/user-accaunts/users/application/users.service';
import { v4 } from 'uuid';
import { UsersTestManager } from './utils/users/users.test.manager';

const CORRECT_ADMIN_AUTH_BASE64 = 'Basic YWRtaW46cXdlcnR5';
const UNCORRECT_ADMIN_AUTH_BASE64 = 'Basic YWRtaW46cXdlc666';

describe('Users (e2e)', () => {
  let app: INestApplication;
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
  });

  beforeEach(async () => {
    await testingController.allDelete();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ create user tests (POST) successful (201)', async () => {
    const createModel = userTestSeeder.createUserDTO();

    const createResponse = await usersTestManger.createUser(
      CORRECT_ADMIN_AUTH_BASE64,
      createModel,
    );

    usersTestManger.expectCorrectModel(createModel, createResponse.body);
  });

  it('/ create user tests (POST) Bad Request (400)', async () => {
    const createModel = userTestSeeder.createUserDTO();

    await usersTestManger.createUser(CORRECT_ADMIN_AUTH_BASE64, createModel);

    await usersTestManger.createUserBadRequset(
      CORRECT_ADMIN_AUTH_BASE64,
      createModel,
    );
  });

  it('/ create user tests (POST) Bad Request (400) invalid password', async () => {
    const createModel = userTestSeeder.createUserDTOInvalidPassword();

    await usersTestManger.createUserBadRequset(
      CORRECT_ADMIN_AUTH_BASE64,
      createModel,
    );
  });
  it('/ delete user tests (DELETE) successful (204)', async () => {
    const createModel = userTestSeeder.createUserDTOForDelete();

    const createResponse = await usersTestManger.createUser(
      CORRECT_ADMIN_AUTH_BASE64,
      createModel,
    );

    const userId = createResponse.body.id;
    await usersTestManger.deleteUser(CORRECT_ADMIN_AUTH_BASE64, userId);
  });

  it('/ delete user tests (DELETE) Unauthorized (401)', async () => {
    const createModel = userTestSeeder.createUserDTOForDelete();

    const createResponse = await usersTestManger.createUser(
      CORRECT_ADMIN_AUTH_BASE64,
      createModel,
    );

    const userId = createResponse.body.id;
    await usersTestManger.deleteUserUnauthorized(
      UNCORRECT_ADMIN_AUTH_BASE64,
      userId,
    );
  });

  it('/ delete user tests (DELETE) If specified user is not exists (404)', async () => {
    const randomUserId = v4();
    await usersTestManger.deleteUserBadUserId(
      CORRECT_ADMIN_AUTH_BASE64,
      randomUserId,
    );
  });

  it('/ get all users tests (GET) successful (201)', async () => {
    const countUsers = 15;
    const arrayUsers = userTestSeeder.createArrayUserDTO(countUsers);
    await usersTestManger.createUsersForGet(
      CORRECT_ADMIN_AUTH_BASE64,
      arrayUsers,
    );

    const req = await usersTestManger.getAllUsers(CORRECT_ADMIN_AUTH_BASE64);

    console.log('req.body', req.body);
    usersTestManger.expectPaginator(req.body, countUsers);
  });

  it('/ get all users tests (GET) Unauthorized (401)', async () => {
    await usersTestManger.getAllUsersUnauthorized(UNCORRECT_ADMIN_AUTH_BASE64);
  });

  it('/ get all users tests (GET) successful with pageSize and pageNumber (201)', async () => {
    const countUsers = 10;
    const pageSize = 3;
    const pageNumber = 4;
    const arrayUsers = userTestSeeder.createArrayUserDTO(countUsers);
    await usersTestManger.createUsersForGet(
      CORRECT_ADMIN_AUTH_BASE64,
      arrayUsers,
    );

    const queryString = `?pageSize=${pageSize}&pageNumber=${pageNumber}`;
    const req = await usersTestManger.getAllUsers(
      CORRECT_ADMIN_AUTH_BASE64,
      queryString,
    );

    usersTestManger.expectPaginator(req.body, countUsers, pageSize, pageNumber);
    usersTestManger.expectCorrectModel(req.body.items[0], arrayUsers[0]);
  });

  it('/ get all users tests (GET) successful with search login (201)', async () => {
    const countUsers = 10;
    const arrayUsers = userTestSeeder.createArrayUserDTO(countUsers);
    await usersTestManger.createUsersForGet(
      CORRECT_ADMIN_AUTH_BASE64,
      arrayUsers,
    );

    const queryString = `?&searchLoginTerm=${arrayUsers[0].login}`;
    const req = await usersTestManger.getAllUsers(
      CORRECT_ADMIN_AUTH_BASE64,
      queryString,
    );

    console.log('queryString', queryString);
    console.log('req', req.body);
    // usersTestManger.expectPaginator(req.body, 1);
    // usersTestManger.expectCorrectModel(req.body.items[0], arrayUsers[0]);
  });
});
