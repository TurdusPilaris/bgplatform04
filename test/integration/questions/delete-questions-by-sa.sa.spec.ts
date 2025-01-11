import { CreateQuestionUseCase } from '../../../src/features/quizGame/application/use-cases/questions/create-question-use-case';
import { QuestionsRepository } from '../../../src/features/quizGame/infractructure/questions.repository';

import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../../src/app.module';
import { TestingController } from '../../../src/features/testing/testing-controller';
import { applyAppSettings } from '../../../src/settings/apply-app-setting';
import { DeleteQuestionUseCase } from '../../../src/features/quizGame/application/use-cases/questions/delete-question-use-case';
import { Question } from '../../../src/features/quizGame/domain/entities/question.entity';
import { InterlayerNotice } from '../../../src/base/models/Interlayer';
import { v4 } from 'uuid';

describe('create question by super admin', () => {
  let app: INestApplication;
  let useCaseDelete: DeleteQuestionUseCase;
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
    useCaseDelete = moduleFixture.get<DeleteQuestionUseCase>(
      DeleteQuestionUseCase,
    );
    questionsRepository = moduleFixture.get(QuestionsRepository);
  });

  beforeEach(async () => {
    await testingController.allDelete();
  });

  afterAll(async () => {
    await app.close();
  });

  it('delete question by super admin successful', async () => {
    const bodyOld = 'Body for test update';
    const correctAnswersOld = ['Paris'];

    //create test question
    const { id } = await questionsRepository.createQuestion(
      Question.create(bodyOld, correctAnswersOld),
    );

    const result = await useCaseDelete.execute({ id });

    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(InterlayerNotice);
    expect(result.hasError()).toBeFalsy();

    //Now check that our question was deleted
    const deletedQuestion = await questionsRepository.findById(id);
    expect(deletedQuestion).toBeNull();
  });

  it('delete question by sa Not found id', async () => {
    const id = v4();

    const result = await useCaseDelete.execute({ id });

    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(InterlayerNotice);
    expect(result.hasError()).toBeTruthy();
    expect(result.code).toBe(404);
    expect(result.extensions[0].field).toBe('questionId');
  });
});
