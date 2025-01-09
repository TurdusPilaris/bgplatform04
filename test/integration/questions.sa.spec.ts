import { CreateQuestionUseCases } from '../../src/features/quizGame/application/use-cases/questions/create-question-use-cases';
import { QuestionsRepository } from '../../src/features/quizGame/infractructure/questions.repository';

import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { TestingController } from '../../src/features/testing/testing-controller';
import { applyAppSettings } from '../../src/settings/apply-app-setting';

describe('create question by super admin', () => {
  let app: INestApplication;
  let useCaseCreate: CreateQuestionUseCases;
  let testingController: TestingController;
  let questionsRepository: QuestionsRepository;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      // .overrideProvider(UsersService)
      // .useClass(UserServiceMock)
      // .overrideProvider(BusinessService)
      // .useClass(BusinessServiceMock)
      .compile();

    testingController = moduleFixture.get(TestingController);
    await testingController.allDelete();
    app = moduleFixture.createNestApplication();

    applyAppSettings(app);
    await app.init();
    //init
    useCaseCreate = moduleFixture.get<CreateQuestionUseCases>(
      CreateQuestionUseCases,
    );
    questionsRepository = moduleFixture.get(QuestionsRepository);
  });

  beforeEach(async () => {
    await testingController.allDelete();
  });

  afterAll(async () => {
    await app.close();
  });

  it('create question by super admin successful', async () => {
    const body = 'What is the capital of France?';
    const correctAnswers = ['Paris'];

    //получим id созданного вопроса
    const result = await useCaseCreate.execute({ body, correctAnswers });
    // const command = new CreateQuestionCommand(body, correctAnswers);
    //  const result = await useCaseCreate.execute(command);
    // const result = await commandBus.execute(command);

    expect(result).toBeDefined();

    //теперь проверяем что все созданное ок
    const createdQuestion = await questionsRepository.findById(result.id);
    expect(createdQuestion.body).toBe(body);
    expect(createdQuestion.answers).toEqual(correctAnswers);
    expect(createdQuestion.published).toBeFalsy();
    expect(createdQuestion.deletedAt).toBeNull();
  });
});
