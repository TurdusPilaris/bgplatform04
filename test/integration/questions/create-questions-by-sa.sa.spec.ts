import { CreateQuestionUseCase } from '../../../src/features/quizGame/application/use-cases/questions/create-question-use-case';
import { QuestionsRepository } from '../../../src/features/quizGame/infractructure/questions.repository';

import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../../src/app.module';
import { TestingController } from '../../../src/features/testing/testing-controller';
import { applyAppSettings } from '../../../src/settings/apply-app-setting';

describe('create question by super admin', () => {
  let app: INestApplication;
  let useCaseCreate: CreateQuestionUseCase;
  let testingController: TestingController;
  let questionsRepository: QuestionsRepository;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    testingController = moduleFixture.get(TestingController);
    await testingController.allDelete();
    app = moduleFixture.createNestApplication();

    applyAppSettings(app);
    await app.init();
    //init
    useCaseCreate = moduleFixture.get<CreateQuestionUseCase>(
      CreateQuestionUseCase,
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
    const { questionId } = await useCaseCreate.execute({
      body,
      correctAnswers,
    });
    // const command = new CreateQuestionCommand(body, correctAnswers);
    //  const result = await useCaseCreate.execute(command);
    // const result = await commandBus.execute(command);

    expect(questionId).toBeDefined();

    //теперь проверяем что все созданное ок
    const createdQuestion = await questionsRepository.findById(questionId);
    expect(createdQuestion.body).toBe(body);
    expect(createdQuestion.answers).toEqual(correctAnswers);
    expect(createdQuestion.published).toBeFalsy();
    expect(createdQuestion.deletedAt).toBeNull();
  });

  it('create question by super admin successful with empty answers', async () => {
    const body = 'What is the capital of France?';
    const correctAnswers = [];

    //получим id созданного вопроса
    const { questionId } = await useCaseCreate.execute({
      body,
      correctAnswers,
    });
    // const command = new CreateQuestionCommand(body, correctAnswers);
    //  const result = await useCaseCreate.execute(command);
    // const result = await commandBus.execute(command);

    expect(questionId).toBeDefined();

    //теперь проверяем что все созданное ок
    const createdQuestion = await questionsRepository.findById(questionId);

    console.log('createdQuestion', createdQuestion);
    expect(createdQuestion.body).toBe(body);
    expect(createdQuestion.answers).toEqual(correctAnswers);
    expect(createdQuestion.published).toBeFalsy();
    expect(createdQuestion.deletedAt).toBeNull();
  });
});
