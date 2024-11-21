import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { applyAppSettings } from '../src/settings/apply-app-setting';
import { UsersTestManager } from './utils/users-test-manager';

import { UserServiceMock } from './mock/user.service.mock';
import { BusinessService } from '../src/base/domain/business-service';
import { BusinessServiceMock } from './mock/business.service.mock';

import { TestingController } from '../src/features/testing/testing-controller';
import { UsersService } from '../src/features/user-accaunts/users/application/users.service';
import { v4 } from 'uuid';
import { blogsTestSeeder } from './utils/blogs.test.seeder';
import { BlogsSaTestManager } from './utils/blogs-sa-test-manager';

const CORRECT_ADMIN_AUTH_BASE64 = 'Basic YWRtaW46cXdlcnR5';
const UNCORRECT_ADMIN_AUTH_BASE64 = 'Basic YWRtaW46cXdlc666';

describe('Blogs sa (e2e)', () => {
  let app: INestApplication;
  let blogsSaTestManager: BlogsSaTestManager;
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
    blogsSaTestManager = new BlogsSaTestManager(app);
  });

  beforeEach(async () => {
    await testingController.allDelete();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ create blog tests (POST) successful (201)', async () => {
    const createModel = blogsTestSeeder.createBlogDTO();

    const createResponse = await blogsSaTestManager.createBlog(
      CORRECT_ADMIN_AUTH_BASE64,
      createModel,
    );

    console.log('req', createResponse.body);
    // usersTestManger.expectCorrectModel(createModel, createResponse.body);
  });
});
