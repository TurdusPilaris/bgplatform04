import { QuestionsRepository } from '../../../src/features/quizGame/infractructure/questions.repository';

import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../../src/app.module';
import { TestingController } from '../../../src/features/testing/testing-controller';
import { applyAppSettings } from '../../../src/settings/apply-app-setting';
import { UpdateQuestionUseCase } from '../../../src/features/quizGame/application/use-cases/questions/update-question-use-case';
import { Question } from '../../../src/features/quizGame/domain/entities/question.entity';
import { InterlayerNotice } from '../../../src/base/models/Interlayer';
import { v4 } from 'uuid';

describe('update question by super admin', () => {
  let app: INestApplication;
  let useCaseUpdate: UpdateQuestionUseCase;
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
    useCaseUpdate = moduleFixture.get<UpdateQuestionUseCase>(
      UpdateQuestionUseCase,
    );
    questionsRepository = moduleFixture.get(QuestionsRepository);
  });

  beforeEach(async () => {
    await testingController.allDelete();
  });

  afterAll(async () => {
    await app.close();
  });

  it('update question by super admin successful', async () => {
    const bodyOld = 'Body for test update';
    const correctAnswersOld = ['Paris'];

    //create test question
    const { id } = await questionsRepository.createQuestion(
      Question.create(bodyOld, correctAnswersOld),
    );

    //create new parameters for updating the question
    const body = 'This is new body for question';
    const correctAnswers = ['New York', 'NY'];

    //let's update the created question
    const result = await useCaseUpdate.execute({ id, body, correctAnswers });

    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(InterlayerNotice);
    expect(result.hasError()).toBeFalsy();

    //then, check that everything is ok
    const createdQuestion = await questionsRepository.findById(id);
    expect(createdQuestion.body).toBe(body);
    expect(createdQuestion.answers).toEqual(correctAnswers);
    expect(createdQuestion.published).toBeFalsy();
    expect(createdQuestion.deletedAt).toBeNull();
  });

  it('update question by super admin successful with empty answers', async () => {
    const bodyOld = 'Body for test update';
    const correctAnswersOld = ['Paris'];

    //create test question
    const { id } = await questionsRepository.createQuestion(
      Question.create(bodyOld, correctAnswersOld),
    );

    //create new parameters for updating the question
    const body = 'This is new body for question';
    const correctAnswers = [];

    //let's update the created question
    const result = await useCaseUpdate.execute({ id, body, correctAnswers });

    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(InterlayerNotice);
    expect(result.hasError()).toBeFalsy();

    //then, check that everything is ok
    const createdQuestion = await questionsRepository.findById(id);
    expect(createdQuestion.body).toBe(body);
    expect(createdQuestion.answers).toEqual(correctAnswers);
    expect(createdQuestion.published).toBeFalsy();
    expect(createdQuestion.deletedAt).toBeNull();
  });

  it('update question by sa with empty answers when question was published', async () => {
    const bodyOld = 'Body for test update';
    const correctAnswersOld = ['Paris'];

    //create test question
    const { id } = await questionsRepository.createQuestion(
      Question.create(bodyOld, correctAnswersOld),
    );

    //publish question
    await questionsRepository.updatePublishedQuestion({ id, published: true });

    //create new parameters for updating the question
    const body = 'This is new body for question';
    const correctAnswers = [];

    //let's update the created question
    const result = await useCaseUpdate.execute({ id, body, correctAnswers });

    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(InterlayerNotice);
    expect(result.hasError()).toBeTruthy();
    expect(result.code).toBe(400);
  });
  it('update question by super admin Not found id', async () => {
    //create random id
    const id = v4();

    //create new parameters for updating the question
    const body = 'This is the new body for the question';
    const correctAnswers = ['New York', 'NY'];

    //Now let's try to update a non-existent ID
    const result = await useCaseUpdate.execute({ id, body, correctAnswers });

    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(InterlayerNotice);
    expect(result.hasError()).toBeTruthy();
    expect(result.code).toBe(404);
    expect(result.extensions[0].field).toBe('questionId');
  });
});
