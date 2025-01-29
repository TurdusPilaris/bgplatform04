import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { applyAppSettings } from '../src/settings/apply-app-setting';

import { TestingController } from '../src/features/testing/testing-controller';

import { QuestionsTestManager } from './utils/question/questions.test.manager';
import { questionTestSeeder } from './utils/question/questions.test.seeder';

const CORRECT_ADMIN_AUTH_BASE64 = 'Basic YWRtaW46cXdlcnR5';
const UNCORRECT_ADMIN_AUTH_BASE64 = 'Basic YWRtaW46cXdlc666';

describe('Questions (e2e)', () => {
  let app: INestApplication;
  let questionsTestManger: QuestionsTestManager;
  let testingController: TestingController;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })

      .compile();

    testingController = moduleFixture.get(TestingController);
    await testingController.allDelete();
    app = moduleFixture.createNestApplication();

    applyAppSettings(app);
    await app.init();

    // Init userManager
    questionsTestManger = new QuestionsTestManager(app);
  });

  beforeEach(async () => {
    await testingController.allDelete();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ get all questions tests (GET) successful (201)', async () => {
    const arrayQuestions = questionTestSeeder.createElevenQuestionsDTO();

    await questionsTestManger.createQuestionsForGet(
      CORRECT_ADMIN_AUTH_BASE64,
      arrayQuestions,
    );

    const req = await questionsTestManger.getAllQuestions(
      CORRECT_ADMIN_AUTH_BASE64,
    );

    questionsTestManger.expectPaginator(req.body, 11);
  });

  it('/ get all users tests (GET) Unauthorized (401)', async () => {
    await questionsTestManger.getAllQuestionsUnauthorized(
      UNCORRECT_ADMIN_AUTH_BASE64,
    );
  });

  it('/ get all users tests (GET) successful with pageSize and pageNumber (201)', async () => {
    const pageSize = 3;
    const pageNumber = 4;
    const arrayQuestions = questionTestSeeder.createElevenQuestionsDTO();
    await questionsTestManger.createQuestionsForGet(
      CORRECT_ADMIN_AUTH_BASE64,
      arrayQuestions,
    );

    const queryString = `?pageSize=${pageSize}&pageNumber=${pageNumber}`;
    const req = await questionsTestManger.getAllQuestions(
      CORRECT_ADMIN_AUTH_BASE64,
      queryString,
    );

    questionsTestManger.expectPaginator(req.body, 11, pageSize, pageNumber);
    questionsTestManger.expectCorrectModel(
      req.body.items[0],
      arrayQuestions[1],
    );
  });

  it('/ get all users tests (GET) successful with find by Body (201)', async () => {
    const arrayQuestions = questionTestSeeder.createElevenQuestionsDTO();
    await questionsTestManger.createQuestionsForGet(
      CORRECT_ADMIN_AUTH_BASE64,
      arrayQuestions,
    );

    const queryString = `?&bodySearchTerm=France`;

    const req = await questionsTestManger.getAllQuestions(
      CORRECT_ADMIN_AUTH_BASE64,
      queryString,
    );

    questionsTestManger.expectPaginator(req.body, 1);
    questionsTestManger.expectCorrectModel(
      req.body.items[0],
      arrayQuestions[0],
    );
  });

  it('/ get all users tests (GET) successful with publish true (201)', async () => {
    const arrayQuestions = questionTestSeeder.createElevenQuestionsDTO();
    const lastQuestion = await questionsTestManger.createQuestionsForGet(
      CORRECT_ADMIN_AUTH_BASE64,
      arrayQuestions,
    );

    await questionsTestManger.updatePublishQuestion(
      CORRECT_ADMIN_AUTH_BASE64,
      {
        publish: true,
      },
      lastQuestion.body.id,
    );
    const queryString = `?&publishedStatus=published`;

    const req = await questionsTestManger.getAllQuestions(
      CORRECT_ADMIN_AUTH_BASE64,
      queryString,
    );

    questionsTestManger.expectPaginator(req.body, 1);
  });

  it('/ get all users tests (GET) successful with publish false (201)', async () => {
    const arrayQuestions = questionTestSeeder.createElevenQuestionsDTO();
    const lastQuestion = await questionsTestManger.createQuestionsForGet(
      CORRECT_ADMIN_AUTH_BASE64,
      arrayQuestions,
    );

    await questionsTestManger.updatePublishQuestion(
      CORRECT_ADMIN_AUTH_BASE64,
      {
        publish: true,
      },
      lastQuestion.body.id,
    );
    const queryString = `?&publishedStatus=notPublished`;

    const req = await questionsTestManger.getAllQuestions(
      CORRECT_ADMIN_AUTH_BASE64,
      queryString,
    );

    questionsTestManger.expectPaginator(req.body, 10);
  });

  it('/ get all users tests (GET) successful with publish all (201)', async () => {
    const arrayQuestions = questionTestSeeder.createElevenQuestionsDTO();
    const lastQuestion = await questionsTestManger.createQuestionsForGet(
      CORRECT_ADMIN_AUTH_BASE64,
      arrayQuestions,
    );

    await questionsTestManger.updatePublishQuestion(
      CORRECT_ADMIN_AUTH_BASE64,
      {
        publish: true,
      },
      lastQuestion.body.id,
    );
    const queryString = `?&publishedStatus=all`;

    const req = await questionsTestManger.getAllQuestions(
      CORRECT_ADMIN_AUTH_BASE64,
      queryString,
    );

    questionsTestManger.expectPaginator(req.body, 11);
  });
});
