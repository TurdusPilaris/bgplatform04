import { INestApplication } from '@nestjs/common';
import { ConnectionToGameUseCase } from '../../../src/features/quizGame/application/use-cases/game/connection-to-game-use-case';
import { TestingController } from '../../../src/features/testing/testing-controller';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../../src/app.module';
import { applyAppSettings } from '../../../src/settings/apply-app-setting';
import { QuestionsRepository } from '../../../src/features/quizGame/infractructure/questions.repository';
import { BcryptService } from '../../../src/base/adapters/bcrypt-service';
import { gameTestSeeder } from '../../utils/game/game.test.seeder';
import { UsersTorRepository } from '../../../src/features/user-accaunts/users/infrastructure/tor/users.tor.repository';
import { GameStatus } from '../../../src/base/models/gameStatus';
import { InterlayerNotice } from '../../../src/base/models/Interlayer';
import { questionTestSeeder } from '../../utils/question/questions.test.seeder';
import { Question } from '../../../src/features/quizGame/domain/entities/question.entity';
import { CheckTheAnswersUseCase } from '../../../src/features/quizGame/application/use-cases/game/check-the-answers-use-case';
import {
  GamePairViewModel,
  QuestionViewModel,
} from '../../../src/features/quizGame/api/models/output/game/game.view.model';
import { AnswerStatus } from '../../../src/base/models/answerStatus';
import { GameQueryRepository } from '../../../src/features/quizGame/infractructure/game.query-repository';

describe('check the answers', () => {
  let firstUserId: string;
  let currentGame: GamePairViewModel;
  let secondUserId: string;
  let actualQuestion: QuestionViewModel[];
  let arrayQuestions: any[];
  let app: INestApplication;
  let useCaseConnection: ConnectionToGameUseCase;
  let useCaseCheckAnswers: CheckTheAnswersUseCase;
  let testingController: TestingController;
  let questionsRepository: QuestionsRepository;
  let gameQueryRepository: GameQueryRepository;
  let usersRepository: UsersTorRepository;
  let bcryptService: BcryptService;

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
    useCaseConnection = moduleFixture.get<ConnectionToGameUseCase>(
      ConnectionToGameUseCase,
    );
    useCaseCheckAnswers = moduleFixture.get<CheckTheAnswersUseCase>(
      CheckTheAnswersUseCase,
    );
    questionsRepository = moduleFixture.get(QuestionsRepository);
    bcryptService = moduleFixture.get(BcryptService);
    usersRepository = moduleFixture.get(UsersTorRepository);
    gameQueryRepository = moduleFixture.get(GameQueryRepository);
  });

  beforeEach(async () => {
    // await testingController.allDelete();
  });

  afterAll(async () => {
    await app.close();
  });

  it('first player submits first correct answer', async () => {
    //create questions
    arrayQuestions = questionTestSeeder
      .createElevenQuestionsDTO()
      .map((dto) => Question.create(dto.body, dto.correctAnswers));
    await questionsRepository.createQuestions(arrayQuestions);
    //we need first user
    const nameFirstUser = 'FirstUser';
    const gameSeeder = gameTestSeeder(bcryptService, usersRepository);
    firstUserId = await gameSeeder.createAuthUser(nameFirstUser);
    //create pending game
    await useCaseConnection.execute({ userId: firstUserId });
    //we need second authorization user
    const nameSecondUser = 'SecondUser';
    secondUserId = await gameSeeder.createAuthUser(nameSecondUser);
    //create active game
    const activeGame = await useCaseConnection.execute({
      userId: secondUserId,
    });

    currentGame = activeGame.data;
    actualQuestion = activeGame.data.questions;
    const currentQuestion = arrayQuestions.find(
      (q) => q.body === actualQuestion[0].body,
    );

    const result = await useCaseCheckAnswers.execute({
      userId: firstUserId,
      answer: currentQuestion.answers[0],
    });
    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(InterlayerNotice);
    expect(result.data).toBeDefined();
    expect(result.data.questionId).toBeDefined();
    expect(result.data.addedAt).toBeDefined();
    expect(result.data.answerStatus).toBe(AnswerStatus.Correct);
    //first user submits first correct answer
  });

  it('second player submits first incorrect answer', async () => {
    const currentQuestion = arrayQuestions.find(
      (q) => q.body === actualQuestion[1].body,
    );

    const incorrectAnswer = '!!!!!';
    const result = await useCaseCheckAnswers.execute({
      userId: secondUserId,
      answer: incorrectAnswer,
    });
    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(InterlayerNotice);
    expect(result.data).toBeDefined();
    expect(result.data.questionId).toBeDefined();
    expect(result.data.addedAt).toBeDefined();
    expect(result.data.answerStatus).toBe(AnswerStatus.Incorrect);
  });
  it('first and second player submit yet 4 answers, end game', async () => {
    //2 answer
    let currentQuestion = arrayQuestions.find(
      (q) => q.body === actualQuestion[1].body,
    );
    await useCaseCheckAnswers.execute({
      userId: firstUserId,
      answer: currentQuestion.answers[0],
    });

    await useCaseCheckAnswers.execute({
      userId: secondUserId,
      answer: currentQuestion.answers[0],
    });
    //3 answer
    currentQuestion = arrayQuestions.find(
      (q) => q.body === actualQuestion[2].body,
    );
    await useCaseCheckAnswers.execute({
      userId: firstUserId,
      answer: currentQuestion.answers[0],
    });

    await useCaseCheckAnswers.execute({
      userId: secondUserId,
      answer: currentQuestion.answers[0],
    });

    //4 answer
    currentQuestion = arrayQuestions.find(
      (q) => q.body === actualQuestion[3].body,
    );
    await useCaseCheckAnswers.execute({
      userId: firstUserId,
      answer: currentQuestion.answers[0],
    });

    await useCaseCheckAnswers.execute({
      userId: secondUserId,
      answer: currentQuestion.answers[0],
    });

    //5 answer
    currentQuestion = arrayQuestions.find(
      (q) => q.body === actualQuestion[4].body,
    );
    await useCaseCheckAnswers.execute({
      userId: firstUserId,
      answer: currentQuestion.answers[0],
    });

    const result = await useCaseCheckAnswers.execute({
      userId: secondUserId,
      answer: currentQuestion.answers[0],
    });

    const resultGame = await gameQueryRepository.findGameById({
      id: currentGame.id,
    });
    console.log('resultGame', resultGame);
    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(InterlayerNotice);
    expect(result.data).toBeDefined();
    expect(result.data.questionId).toBe(currentQuestion.id);
    expect(result.data.addedAt).toBeDefined();
    expect(result.data.answerStatus).toBe(AnswerStatus.Correct);
  });

  it('user is in active pair but has already answered to all questions', async () => {
    const result = await useCaseCheckAnswers.execute({
      userId: firstUserId,
      answer: 'dgdgdg',
    });
    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(InterlayerNotice);
    expect(result.hasError()).toBeTruthy();
    expect(result.code).toBe(403);
  });
});
