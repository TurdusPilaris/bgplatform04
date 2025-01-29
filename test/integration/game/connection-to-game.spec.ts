import { INestApplication } from '@nestjs/common';
import { ConnectionToGameUseCase } from '../../../src/features/quizGame/application/use-cases/game/connection-to-game-use-case';
import { TestingController } from '../../../src/features/testing/testing-controller';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../../src/app.module';
import { applyAppSettings } from '../../../src/settings/apply-app-setting';
import { QuestionsRepository } from '../../../src/features/quizGame/infractructure/questions.repository';
import { BcryptService } from '../../../src/base/adapters/bcrypt-service';
import { UsersTorRepository } from '../../../src/features/user-accaunts/users/infrastructure/tor/users.tor.repository';
import { InterlayerNotice } from '../../../src/base/models/Interlayer';
import { GameQueryRepository } from '../../../src/features/quizGame/infractructure/game.query-repository';
import { GameStatus } from '../../../src/base/models/gameStatus';
import { GameTestManager } from '../../utils/game/game.test.manager';
import { questionTestSeeder } from '../../utils/question/questions.test.seeder';
import { GetCurrentGameIdUseCase } from '../../../src/features/quizGame/application/use-cases/game/get-current-game-id-use-case';
import { IsGameExistsAndUserParticipantUseCase } from '../../../src/features/quizGame/application/use-cases/game/is-game-exists-and-user-participant-use-case';

describe('connection to game', () => {
  let firstUserId: string;
  let secondUserId: string;
  let app: INestApplication;
  let useCaseConnection: ConnectionToGameUseCase;
  let testingController: TestingController;
  let questionsRepository: QuestionsRepository;
  let gameQueryRepository: GameQueryRepository;
  let gameTestManager: GameTestManager;
  let gameId: string;
  let useCaseGetCurrentGame: GetCurrentGameIdUseCase;
  let isGameExistsAndUserParticipantUseCase: IsGameExistsAndUserParticipantUseCase;

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
    questionsRepository = moduleFixture.get(QuestionsRepository);
    gameQueryRepository = moduleFixture.get(GameQueryRepository);
    gameTestManager = new GameTestManager(
      moduleFixture.get(BcryptService),
      moduleFixture.get(UsersTorRepository),
    );
    useCaseGetCurrentGame = moduleFixture.get<GetCurrentGameIdUseCase>(
      GetCurrentGameIdUseCase,
    );
    isGameExistsAndUserParticipantUseCase = moduleFixture.get(
      IsGameExistsAndUserParticipantUseCase,
    );
  });

  beforeEach(async () => {
    // await testingController.allDelete();
  });

  afterAll(async () => {
    await app.close();
  });

  it('create new game, when not existing random pending pair', async () => {
    //we need authorization user
    const nameFirstUser = 'FirstUser';
    firstUserId = await gameTestManager.createAuthUser(nameFirstUser);

    const result = await useCaseConnection.execute({ userId: firstUserId });
    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(InterlayerNotice);
    expect(result.hasError()).toBeFalsy();

    const gameId = result.data;

    const resultGame = await gameQueryRepository.findGameById({
      id: gameId,
    });

    expect(resultGame.firstPlayerProgress).toBeDefined();
    expect(resultGame.firstPlayerProgress.player).toBeDefined();
    expect(resultGame.firstPlayerProgress.player.login).toBe(nameFirstUser);
    expect(resultGame.secondPlayerProgress).toBeNull();
    expect(resultGame.questions).toBeNull();
    expect(resultGame.startGameDate).toBeNull();
    expect(resultGame.finishGameDate).toBeNull();
    expect(resultGame.status).toBe(GameStatus.Pending);
  });

  it('user trying connection when exist 1 pair where player 1 is he', async () => {
    //we need authorization user
    const result = await useCaseConnection.execute({ userId: firstUserId });
    gameTestManager.checkForA403Error(result);
  });

  it('Returns started existing pair', async () => {
    //create questions
    const arrayQuestions =
      await questionTestSeeder.createElevenQuestionsDTO(questionsRepository);
    await questionsRepository.createQuestions(arrayQuestions);

    await questionsRepository.publishAllQuestions();

    //we need second authorization user
    const nameFirstUser = 'FirstUser';
    const nameSecondUser = 'SecondUser';
    secondUserId = await gameTestManager.createAuthUser(nameSecondUser);

    const result = await useCaseConnection.execute({ userId: secondUserId });
    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(InterlayerNotice);

    gameId = result.data;

    const resultGame = await gameQueryRepository.findGameById({
      id: gameId,
    });

    //check first user
    expect(resultGame.firstPlayerProgress).toBeDefined();
    expect(resultGame.firstPlayerProgress.player).toBeDefined();
    expect(resultGame.firstPlayerProgress.player.login).toBe(nameFirstUser);
    expect(resultGame.firstPlayerProgress.player.id).toBe(firstUserId);
    //check second user
    expect(resultGame.secondPlayerProgress).toBeDefined();
    expect(resultGame.secondPlayerProgress.player).toBeDefined();
    expect(resultGame.secondPlayerProgress.player.login).toBe(nameSecondUser);
    expect(resultGame.secondPlayerProgress.player.id).toBe(secondUserId);

    expect(resultGame.questions.length).toBe(5);
    expect(resultGame.startGameDate).not.toBeNull();
    expect(resultGame.finishGameDate).toBeNull();
    expect(resultGame.status).toBe(GameStatus.Active);
  });

  it('Should return new created active game; status 200', async () => {
    console.log('gameId________________', gameId);
    const resultOfCheking = await isGameExistsAndUserParticipantUseCase.execute(
      {
        userId: firstUserId,
        gameId,
      },
    );

    console.log('resultOfCheking---------------------', resultOfCheking);
    expect(resultOfCheking).toBeDefined();
    expect(resultOfCheking).toBeInstanceOf(InterlayerNotice);
    expect(resultOfCheking.hasError()).toBeFalsy();

    const result = await useCaseGetCurrentGame.execute({ userId: firstUserId });
    expect(result.data).toBe(gameId);
    const result2 = await useCaseGetCurrentGame.execute({
      userId: secondUserId,
    });
    expect(result2.data).toBe(gameId);
  });
  it('current user is already participating in active pair', async () => {
    const result = await useCaseConnection.execute({ userId: firstUserId });
    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(InterlayerNotice);
    expect(result.hasError()).toBeTruthy();
    expect(result.code).toBe(403);
  });
});
