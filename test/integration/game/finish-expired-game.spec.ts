import { TestingController } from '../../../src/features/testing/testing-controller';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../../src/app.module';
import { applyAppSettings } from '../../../src/settings/apply-app-setting';
import { ConnectionToGameUseCase } from '../../../src/features/quizGame/application/use-cases/game/connection-to-game-use-case';
import { CheckTheAnswersUseCase } from '../../../src/features/quizGame/application/use-cases/game/check-the-answers-use-case';
import { QuestionsRepository } from '../../../src/features/quizGame/infractructure/questions.repository';
import { GameQueryRepository } from '../../../src/features/quizGame/infractructure/game.query-repository';
import { GameTestManager } from '../../utils/game/game.test.manager';
import { BcryptService } from '../../../src/base/adapters/bcrypt-service';
import { UsersTorRepository } from '../../../src/features/user-accaunts/users/infrastructure/tor/users.tor.repository';
import { GetCurrentGameIdUseCase } from '../../../src/features/quizGame/application/use-cases/game/get-current-game-id-use-case';
import { INestApplication } from '@nestjs/common';
import { questionTestSeeder } from '../../utils/question/questions.test.seeder';
import {
  GamePairViewModel,
  QuestionViewModel,
} from '../../../src/features/quizGame/api/models/output/game/game.view.model';
import { GameStatus } from '../../../src/base/models/gameStatus';

describe('finish expired game', () => {
  let firstUserId: string;
  let currentGame: GamePairViewModel;
  let secondUserId: string;
  let app: INestApplication;
  let testingController: TestingController;
  let useCaseConnection: ConnectionToGameUseCase;
  let useCaseCheckAnswers: CheckTheAnswersUseCase;
  let questionsRepository: QuestionsRepository;
  let gameQueryRepository: GameQueryRepository;
  let gameTestManager: GameTestManager;
  let actualQuestion: QuestionViewModel[];
  let arrayQuestions: any[];

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
    gameQueryRepository = moduleFixture.get(GameQueryRepository);
    gameTestManager = new GameTestManager(
      moduleFixture.get(BcryptService),
      moduleFixture.get(UsersTorRepository),
    );
  });

  beforeEach(async () => {
    // await testingController.allDelete();
  });

  afterAll(async () => {
    await app.close();
  });

  it('Should return finished game', async () => {
    //create questions
    arrayQuestions =
      await questionTestSeeder.createElevenQuestionsDTO(questionsRepository);

    //we need first user
    const nameFirstUser = 'FirstUser';
    firstUserId = await gameTestManager.createAuthUser(nameFirstUser);

    //create pending game
    await useCaseConnection.execute({ userId: firstUserId });

    //we need second authorization user
    const nameSecondUser = 'SecondUser';
    secondUserId = await gameTestManager.createAuthUser(nameSecondUser);

    //create active game
    const activeGameResult = await useCaseConnection.execute({
      userId: secondUserId,
    });

    //get created game
    currentGame = await gameQueryRepository.findGameById({
      id: activeGameResult.data,
    });

    //get 5 actual questions
    actualQuestion = currentGame.questions;

    //get 5 correct answers
    //get correct answer for 1 question
    const firstCorrectAnswer = await gameTestManager.getCorrectAnswer(
      1,
      arrayQuestions,
      actualQuestion,
    );
    await useCaseCheckAnswers.execute({
      userId: firstUserId,
      answer: firstCorrectAnswer,
    });

    //get correct answer for 2 question
    const secondCorrectAnswer = await gameTestManager.getCorrectAnswer(
      2,
      arrayQuestions,
      actualQuestion,
    );
    await useCaseCheckAnswers.execute({
      userId: firstUserId,
      answer: secondCorrectAnswer,
    });

    //get correct answer for 3 question
    const thirdCorrectAnswer = await gameTestManager.getCorrectAnswer(
      3,
      arrayQuestions,
      actualQuestion,
    );
    await useCaseCheckAnswers.execute({
      userId: firstUserId,
      answer: thirdCorrectAnswer,
    });

    //get correct answer for 4 question
    const fourthCorrectAnswer = await gameTestManager.getCorrectAnswer(
      4,
      arrayQuestions,
      actualQuestion,
    );
    await useCaseCheckAnswers.execute({
      userId: firstUserId,
      answer: fourthCorrectAnswer,
    });

    //get correct answer for 5 question
    const fifthCorrectAnswer = await gameTestManager.getCorrectAnswer(
      5,
      arrayQuestions,
      actualQuestion,
    );
    await useCaseCheckAnswers.execute({
      userId: firstUserId,
      answer: fifthCorrectAnswer,
    });

    const resultGame = await gameQueryRepository.findGameById({
      id: currentGame.id,
    });

    expect(resultGame.status).toBe(GameStatus.Active);
    expect(resultGame.finishGameDate).toBeNull();
    expect(resultGame.firstPlayerProgress.score).toBe(5);
    expect(resultGame.secondPlayerProgress.score).toBe(0);

    console.log('after Date', new Date());
    setTimeout(async () => {}, 10000);
    const resultGameFinished = await gameQueryRepository.findGameById({
      id: currentGame.id,
    });
    expect(resultGameFinished.status).toBe(GameStatus.Finished);
    expect(resultGameFinished.finishGameDate).not.toBeNull();
    expect(resultGameFinished.firstPlayerProgress.score).toBe(6);
    expect(resultGameFinished.secondPlayerProgress.score).toBe(0);
  });
});
