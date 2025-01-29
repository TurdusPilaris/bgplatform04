import { INestApplication } from '@nestjs/common';
import { ConnectionToGameUseCase } from '../../../src/features/quizGame/application/use-cases/game/connection-to-game-use-case';
import { TestingController } from '../../../src/features/testing/testing-controller';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../../src/app.module';
import { applyAppSettings } from '../../../src/settings/apply-app-setting';
import { QuestionsRepository } from '../../../src/features/quizGame/infractructure/questions.repository';
import { BcryptService } from '../../../src/base/adapters/bcrypt-service';
import { UsersTorRepository } from '../../../src/features/user-accaunts/users/infrastructure/tor/users.tor.repository';
import { GameStatus } from '../../../src/base/models/gameStatus';
import { questionTestSeeder } from '../../utils/question/questions.test.seeder';
import { CheckTheAnswersUseCase } from '../../../src/features/quizGame/application/use-cases/game/check-the-answers-use-case';
import {
  GamePairViewModel,
  QuestionViewModel,
} from '../../../src/features/quizGame/api/models/output/game/game.view.model';
import { GameQueryRepository } from '../../../src/features/quizGame/infractructure/game.query-repository';
import { GameTestManager } from '../../utils/game/game.test.manager';
import { GetCurrentGameIdUseCase } from '../../../src/features/quizGame/application/use-cases/game/get-current-game-id-use-case';

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
  let gameTestManager: GameTestManager;
  let useCaseGetCurrentGame: GetCurrentGameIdUseCase;

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
    useCaseGetCurrentGame = moduleFixture.get<GetCurrentGameIdUseCase>(
      GetCurrentGameIdUseCase,
    );
  });

  beforeEach(async () => {
    // await testingController.allDelete();
  });

  afterAll(async () => {
    await app.close();
  });

  it('error if current user is not inside active pai', async () => {
    // 1. create auth user
    const nameZeroUser = 'ZeroUser';
    const zeroUserId = await gameTestManager.createAuthUser(nameZeroUser);

    // 2. send random answer
    const result = await useCaseCheckAnswers.execute({
      userId: zeroUserId,
      answer: 'fsdffdfdf',
    });

    //have to 403 error
    gameTestManager.checkForA403Error(result);
  });

  it('first player submits first correct answer', async () => {
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

    //get correct answer for 1 question
    const correctAnswer = await gameTestManager.getCorrectAnswer(
      1,
      arrayQuestions,
      actualQuestion,
    );
    const result = await useCaseCheckAnswers.execute({
      userId: firstUserId,
      answer: correctAnswer,
    });

    //check correct answer
    gameTestManager.checkCorrectAnswer(result);
  });

  it('first player sen yet 4 answer and second player submits 3 correct answers', async () => {
    const incorrectAnswer = '!!!!!';

    const result = await useCaseCheckAnswers.execute({
      userId: secondUserId,
      answer: incorrectAnswer,
    });

    //check incorrect answer
    gameTestManager.checkIncorrectAnswer(result);
  });

  it('first submit 5 and second player submit yet 4 answers, sucessfull', async () => {
    //2 answer
    const twoCorrectAnswer = await gameTestManager.getCorrectAnswer(
      2,
      arrayQuestions,
      actualQuestion,
    );

    await useCaseCheckAnswers.execute({
      userId: firstUserId,
      answer: twoCorrectAnswer,
    });

    await useCaseCheckAnswers.execute({
      userId: secondUserId,
      answer: twoCorrectAnswer,
    });

    //3 answer
    const freeCorrectAnswer = await gameTestManager.getCorrectAnswer(
      3,
      arrayQuestions,
      actualQuestion,
    );
    await useCaseCheckAnswers.execute({
      userId: firstUserId,
      answer: freeCorrectAnswer,
    });

    await useCaseCheckAnswers.execute({
      userId: secondUserId,
      answer: freeCorrectAnswer,
    });

    //4 answer
    const fourCorrectAnswer = await gameTestManager.getCorrectAnswer(
      4,
      arrayQuestions,
      actualQuestion,
    );
    await useCaseCheckAnswers.execute({
      userId: firstUserId,
      answer: fourCorrectAnswer,
    });

    await useCaseCheckAnswers.execute({
      userId: secondUserId,
      answer: fourCorrectAnswer,
    });

    //5 answer
    const fiveCorrectAnswer = await gameTestManager.getCorrectAnswer(
      5,
      arrayQuestions,
      actualQuestion,
    );
    const result = await useCaseCheckAnswers.execute({
      userId: firstUserId,
      answer: fiveCorrectAnswer,
    });

    const resultGame = await gameQueryRepository.findGameById({
      id: currentGame.id,
    });

    gameTestManager.checkCorrectAnswer(result);

    expect(resultGame.status).toBe(GameStatus.Active);
    expect(resultGame.finishGameDate).toBeNull();
    expect(resultGame.firstPlayerProgress.score).toBe(5);
    expect(resultGame.secondPlayerProgress.score).toBe(3);
  });
  it('first player submit 6 answers, 403 error', async () => {
    //2 answer

    const result = await useCaseCheckAnswers.execute({
      userId: firstUserId,
      answer: 'gdffdgfdhfh',
    });

    gameTestManager.checkForA403Error(result);
  });

  it('last answer from second player', async () => {
    //5 answer
    const currentQuestion = arrayQuestions.find(
      (q) => q.body === actualQuestion[4].body,
    );

    const result = await useCaseCheckAnswers.execute({
      userId: secondUserId,
      answer: currentQuestion.answers[0],
    });

    const resultGame = await gameQueryRepository.findGameById({
      id: currentGame.id,
    });

    gameTestManager.checkCorrectAnswer(result);
    expect(result.data.questionId).toBe(currentQuestion.id);

    expect(resultGame.status).toBe(GameStatus.Finished);
    expect(resultGame.finishGameDate).not.toBeNull();
    expect(resultGame.firstPlayerProgress.score).toBe(6);
    expect(resultGame.secondPlayerProgress.score).toBe(4);
  });

  it('error if game was finish', async () => {
    //5 answer
    const currentQuestion = arrayQuestions.find(
      (q) => q.body === actualQuestion[4].body,
    );

    const result = await useCaseCheckAnswers.execute({
      userId: secondUserId,
      answer: currentQuestion.answers[0],
    });

    gameTestManager.checkForA403Error(result);
  });

  //the first user answered 4 questions correctly,
  // but answered all questions earlier than the second user
  it('firstPlayer should win with 5 scores ', async () => {
    //create pending game
    await useCaseConnection.execute({ userId: firstUserId });

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
    //1 answers
    const oneCorrectAnswer = await gameTestManager.getCorrectAnswer(
      1,
      arrayQuestions,
      actualQuestion,
    );

    //2 answers
    const twoCorrectAnswer = await gameTestManager.getCorrectAnswer(
      2,
      arrayQuestions,
      actualQuestion,
    );

    //3 answers
    const threeCorrectAnswer = await gameTestManager.getCorrectAnswer(
      3,
      arrayQuestions,
      actualQuestion,
    );

    //4 answers
    const fourCorrectAnswer = await gameTestManager.getCorrectAnswer(
      4,
      arrayQuestions,
      actualQuestion,
    );

    //five answers
    const fiveCorrectAnswer = await gameTestManager.getCorrectAnswer(
      5,
      arrayQuestions,
      actualQuestion,
    );

    //add 1 correct answer by firstPlayer;
    await useCaseCheckAnswers.execute({
      userId: firstUserId,
      answer: oneCorrectAnswer,
    });

    //add 2 correct answer by firstPlayer;
    await useCaseCheckAnswers.execute({
      userId: firstUserId,
      answer: twoCorrectAnswer,
    });

    //add 1 correct answer by secondPlayer;
    await useCaseCheckAnswers.execute({
      userId: secondUserId,
      answer: oneCorrectAnswer,
    });

    //add 2 correct answer by secondPlayer;
    await useCaseCheckAnswers.execute({
      userId: secondUserId,
      answer: twoCorrectAnswer,
    });

    //add 3 incorrect answer by firstPlayer;
    await useCaseCheckAnswers.execute({
      userId: firstUserId,
      answer: 'blablabla',
    });

    //add 3 correct answer by secondPlayer;
    await useCaseCheckAnswers.execute({
      userId: secondUserId,
      answer: threeCorrectAnswer,
    });

    //add 4 incorrect answer by firstPlayer;
    await useCaseCheckAnswers.execute({
      userId: firstUserId,
      answer: fourCorrectAnswer,
    });

    //add 4 correct answer by secondPlayer;
    await useCaseCheckAnswers.execute({
      userId: secondUserId,
      answer: fourCorrectAnswer,
    });

    //add 5 incorrect answer by firstPlayer;
    await useCaseCheckAnswers.execute({
      userId: firstUserId,
      answer: fiveCorrectAnswer,
    });

    //add 5 correct answer by secondPlayer;
    await useCaseCheckAnswers.execute({
      userId: secondUserId,
      answer: fiveCorrectAnswer,
    });

    const resultGame = await gameQueryRepository.findGameById({
      id: currentGame.id,
    });

    expect(resultGame.status).toBe(GameStatus.Finished);
    expect(resultGame.finishGameDate).not.toBeNull();
    expect(resultGame.firstPlayerProgress.score).toBe(5);
    expect(resultGame.secondPlayerProgress.score).toBe(5);
  });

  it('first player is start game', async () => {
    //create pending game
    await useCaseConnection.execute({ userId: firstUserId });
  });
});
