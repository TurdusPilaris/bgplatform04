import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { applyAppSettings } from '../src/settings/apply-app-setting';

import { UserServiceMock } from './mock/user.service.mock';
import { BusinessService } from '../src/base/domain/business-service';
import { BusinessServiceMock } from './mock/business.service.mock';

import { TestingController } from '../src/features/testing/testing-controller';
import { UsersService } from '../src/features/user-accaunts/users/application/users.service';
import { v4 } from 'uuid';
import { blogsTestSeeder } from './utils/blogs/blogs.test.seeder';
import { BlogsSaTestManager } from './utils/blogs/blogs.sa.test.manager';
import { CommonTestManager } from './utils/common/common.test.manager';

const CORRECT_ADMIN_AUTH_BASE64 = 'Basic YWRtaW46cXdlcnR5';
const UNCORRECT_ADMIN_AUTH_BASE64 = 'Basic YWRtaW46cXdlc666';

describe('Blogs sa (e2e)', () => {
  let app: INestApplication;
  let blogsSaTestManager: BlogsSaTestManager;
  let commonTestManager: CommonTestManager;
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
    commonTestManager = new CommonTestManager();
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

    blogsSaTestManager.expectCorrectModel(createModel, createResponse.body);
  });

  it('/ create blog tests (POST) successful (201)', async () => {
    const createModel = blogsTestSeeder.createBlogDTO();

    const createResponse = await blogsSaTestManager.createBlog(
      CORRECT_ADMIN_AUTH_BASE64,
      createModel,
    );

    blogsSaTestManager.expectCorrectModel(createModel, createResponse.body);
  });

  it('/ create blog tests (POST) Unauthorize (401)', async () => {
    const createModel = blogsTestSeeder.createBlogDTO();

    await blogsSaTestManager.createBlogUnauthorized(
      UNCORRECT_ADMIN_AUTH_BASE64,
      createModel,
    );
  });

  it('/ create blog tests (POST) bad request (400) too big name', async () => {
    const createModel = blogsTestSeeder.createBlogDTO();
    createModel.name = 'qqqqqqqqqqqqqqqqqqqqq';
    const createResponse = await blogsSaTestManager.createBlogBadRequest(
      CORRECT_ADMIN_AUTH_BASE64,
      createModel,
    );

    blogsSaTestManager.expectCorrectBadRequest(createResponse.body, 'name');
  });

  it('/ create blog tests (POST) bad request (400) incorrect websiteUrl', async () => {
    const createModel = blogsTestSeeder.createBlogDTO();
    createModel.websiteUrl = 'ruiyuriyuiyutituyotiyutioyutiouyro';
    const createResponse = await blogsSaTestManager.createBlogBadRequest(
      CORRECT_ADMIN_AUTH_BASE64,
      createModel,
    );

    blogsSaTestManager.expectCorrectBadRequest(
      createResponse.body,
      'websiteUrl',
    );
  });

  it('/ update blog tests (PUT) successful (204)', async () => {
    const createModel = blogsTestSeeder.createBlogDTO();

    const createResponseCreate = await blogsSaTestManager.createBlog(
      CORRECT_ADMIN_AUTH_BASE64,
      createModel,
    );

    //теперь изменим входную модель
    createModel.name = 'update model';
    createModel.websiteUrl = 'https://dadadadad.com';
    createModel.description = 'this is update description';

    const createResponse = await blogsSaTestManager.updateBlog(
      CORRECT_ADMIN_AUTH_BASE64,
      createModel,
      createResponseCreate.body.id,
    );
  });
  it('/ update blog tests (PUT) Unauthorize (401)', async () => {
    const createModel = blogsTestSeeder.createBlogDTO();

    const createResponseCreate = await blogsSaTestManager.createBlog(
      CORRECT_ADMIN_AUTH_BASE64,
      createModel,
    );

    //теперь изменим входную модель
    createModel.name = 'update model';
    createModel.websiteUrl = 'https://dadadadad.com';
    createModel.description = 'this is update description';

    const createResponse = await blogsSaTestManager.updateBlogUnauthorized(
      UNCORRECT_ADMIN_AUTH_BASE64,
      createModel,
      createResponseCreate.body.id,
    );
  });

  it('/ update blog tests (PUT) NOT FOUND (404)', async () => {
    const createModel = blogsTestSeeder.createBlogDTO();

    const randomId = v4();
    await blogsSaTestManager.updateBlogNotFound(
      CORRECT_ADMIN_AUTH_BASE64,
      createModel,
      randomId,
    );
  });

  it('/ delete blog tests (DELETE) successful (204)', async () => {
    const createModel = blogsTestSeeder.createBlogDTO();

    const createResponseCreate = await blogsSaTestManager.createBlog(
      CORRECT_ADMIN_AUTH_BASE64,
      createModel,
    );

    await blogsSaTestManager.deleteBlog(
      CORRECT_ADMIN_AUTH_BASE64,
      createResponseCreate.body.id,
    );
  });

  it('/ delete blog tests (DELETE) Unauthorize (401)', async () => {
    const createModel = blogsTestSeeder.createBlogDTO();

    const createResponseCreate = await blogsSaTestManager.createBlog(
      CORRECT_ADMIN_AUTH_BASE64,
      createModel,
    );

    await blogsSaTestManager.deleteBlogUnauthorized(
      UNCORRECT_ADMIN_AUTH_BASE64,
      createResponseCreate.body.id,
    );
  });

  it('/ delete blog tests (DELETE) not founD (404)', async () => {
    await blogsSaTestManager.deleteBlogNotFound(
      CORRECT_ADMIN_AUTH_BASE64,
      v4(),
    );
  });

  it('/ create post by blog id tests (POST) sucessfull (201)', async () => {
    const createModel = blogsTestSeeder.createBlogDTO();

    const createResponseCreate = await blogsSaTestManager.createBlog(
      CORRECT_ADMIN_AUTH_BASE64,
      createModel,
    );

    //getting real blog id
    const blogId = createResponseCreate.body.id;

    const postDTO = blogsTestSeeder.createPostWithoutBlogIdDTO();

    const createResponse = await blogsSaTestManager.createPostByBlogId(
      CORRECT_ADMIN_AUTH_BASE64,
      postDTO,
      blogId,
    );
    blogsSaTestManager.expectCorrectModelForPost(
      postDTO,
      blogId,
      createResponse.body,
    );
  });

  it('/ create post by blog id tests (POST) not found (404)', async () => {
    //getting real blog id
    const blogId = v4();

    const postDTO = blogsTestSeeder.createPostWithoutBlogIdDTO();

    await blogsSaTestManager.createPostByBlogIdNotFound(
      CORRECT_ADMIN_AUTH_BASE64,
      postDTO,
      blogId,
    );
  });
  it('/ create post by blog id tests (POST) Unauthorize (401)', async () => {
    //getting real blog id
    const blogId = v4();

    const postDTO = blogsTestSeeder.createPostWithoutBlogIdDTO();

    await blogsSaTestManager.createPostByBlogIdUnauthorized(
      UNCORRECT_ADMIN_AUTH_BASE64,
      postDTO,
      blogId,
    );
  });

  it('/ create post by blog id tests (POST) bad request title (400)', async () => {
    const createModel = blogsTestSeeder.createBlogDTO();

    const createResponseCreate = await blogsSaTestManager.createBlog(
      CORRECT_ADMIN_AUTH_BASE64,
      createModel,
    );

    //getting real blog id
    const blogId = createResponseCreate.body.id;

    const postDTO = blogsTestSeeder.createPostWithoutBlogIdDTO();

    //change title > 30
    postDTO.title = 'a'.repeat(31);
    const createResponse =
      await blogsSaTestManager.createPostByBlogIdBadRequest(
        CORRECT_ADMIN_AUTH_BASE64,
        postDTO,
        blogId,
      );

    blogsSaTestManager.expectCorrectBadRequest(createResponse.body, 'title');
  });

  it('/ create post by blog id tests (POST) bad request shortDescription (400)', async () => {
    const createModel = blogsTestSeeder.createBlogDTO();

    const createResponseCreate = await blogsSaTestManager.createBlog(
      CORRECT_ADMIN_AUTH_BASE64,
      createModel,
    );

    //getting real blog id
    const blogId = createResponseCreate.body.id;

    const postDTO = blogsTestSeeder.createPostWithoutBlogIdDTO();

    //change shortDescription > 100
    postDTO.shortDescription = 'a'.repeat(101);
    const createResponse =
      await blogsSaTestManager.createPostByBlogIdBadRequest(
        CORRECT_ADMIN_AUTH_BASE64,
        postDTO,
        blogId,
      );

    blogsSaTestManager.expectCorrectBadRequest(
      createResponse.body,
      'shortDescription',
    );
  });

  it('/ create post by blog id tests (POST) bad request shortDescription (400)', async () => {
    const createModel = blogsTestSeeder.createBlogDTO();

    const createResponseCreate = await blogsSaTestManager.createBlog(
      CORRECT_ADMIN_AUTH_BASE64,
      createModel,
    );

    //getting real blog id
    const blogId = createResponseCreate.body.id;

    const postDTO = blogsTestSeeder.createPostWithoutBlogIdDTO();

    //change content > 1000
    postDTO.content = 'a'.repeat(1001);
    const createResponse =
      await blogsSaTestManager.createPostByBlogIdBadRequest(
        CORRECT_ADMIN_AUTH_BASE64,
        postDTO,
        blogId,
      );

    blogsSaTestManager.expectCorrectBadRequest(createResponse.body, 'content');
  });

  it('/ get blogs tests (GET) successful (200)', async () => {
    const createModel = blogsTestSeeder.createBlogDTO();

    const createResponseCreate = await blogsSaTestManager.createBlog(
      CORRECT_ADMIN_AUTH_BASE64,
      createModel,
    );

    const createResponse = await blogsSaTestManager.getBlogs(
      CORRECT_ADMIN_AUTH_BASE64,
      '',
    );

    commonTestManager.expectPaginator(createResponse.body, 1);
  });
  it('/ get blogs tests (GET) successful (200) pagination of big count', async () => {
    const countUsers = 19;
    const pageSize = 3;
    const pageNumber = 4;
    const arrayCreateModel = blogsTestSeeder.createArrayBlogDTO(countUsers);

    for (let i = 0; i < arrayCreateModel.length; i++) {
      await blogsSaTestManager.createBlog(
        CORRECT_ADMIN_AUTH_BASE64,
        arrayCreateModel[i],
      );
    }
    const queryString = `?pageSize=${pageSize}&pageNumber=${pageNumber}`;
    const createResponse = await blogsSaTestManager.getBlogs(
      CORRECT_ADMIN_AUTH_BASE64,
      queryString,
    );

    commonTestManager.expectPaginator(
      createResponse.body,
      19,
      pageSize,
      pageNumber,
    );
  });

  it('/ get blogs tests (GET) unauthorize (401)', async () => {
    await blogsSaTestManager.getBlogsUnauthorize(
      UNCORRECT_ADMIN_AUTH_BASE64,
      '',
    );
  });

  it('/ get blogs not sa tests (GET) successful (200)', async () => {
    const createModel = blogsTestSeeder.createBlogDTO();

    await blogsSaTestManager.createBlog(CORRECT_ADMIN_AUTH_BASE64, createModel);

    const createResponse = await blogsSaTestManager.getBlogsNotSa('');

    commonTestManager.expectPaginator(createResponse.body, 1);
  });
  it('/ get blogs not sa tests (GET) successful (200)', async () => {
    const countUsers = 19;
    const pageSize = 3;
    const pageNumber = 4;
    const arrayCreateModel = blogsTestSeeder.createArrayBlogDTO(countUsers);

    for (let i = 0; i < arrayCreateModel.length; i++) {
      await blogsSaTestManager.createBlog(
        CORRECT_ADMIN_AUTH_BASE64,
        arrayCreateModel[i],
      );
    }
    const queryString = `?pageSize=${pageSize}&pageNumber=${pageNumber}`;
    const createResponse = await blogsSaTestManager.getBlogsNotSa(queryString);

    commonTestManager.expectPaginator(
      createResponse.body,
      19,
      pageSize,
      pageNumber,
    );
  });
});
