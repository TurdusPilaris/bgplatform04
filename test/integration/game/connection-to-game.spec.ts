import { INestApplication } from '@nestjs/common';
import { ConnectionToGameUseCase } from '../../../src/features/quizGame/application/use-cases/game/connection-to-game-use-case';
import { TestingController } from '../../../src/features/testing/testing-controller';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../../src/app.module';
import { applyAppSettings } from '../../../src/settings/apply-app-setting';
import { CreateQuestionUseCase } from '../../../src/features/quizGame/application/use-cases/questions/create-question-use-case';
import { QuestionsRepository } from '../../../src/features/quizGame/infractructure/questions.repository';
import { BcryptService } from '../../../src/base/adapters/bcrypt-service';
import { gameTestSeeder } from '../../utils/game/game.test.seeder';
import { UsersTorRepository } from '../../../src/features/user-accaunts/users/infrastructure/tor/users.tor.repository';
import { GameStatus } from '../../../src/base/models/gameStatus';
import { InterlayerNotice } from '../../../src/base/models/Interlayer';
import { questionTestSeeder } from '../../utils/question/questions.test.seeder';
import { Question } from '../../../src/features/quizGame/domain/entities/question.entity';

describe('connection to game', () => {
  let firstUserId: string;
  let app: INestApplication;
  let useCaseConnection: ConnectionToGameUseCase;
  let testingController: TestingController;
  let questionsRepository: QuestionsRepository;
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
    questionsRepository = moduleFixture.get(QuestionsRepository);
    bcryptService = moduleFixture.get(BcryptService);
    usersRepository = moduleFixture.get(UsersTorRepository);
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
    const gameSeeder = gameTestSeeder(bcryptService, usersRepository);
    const userId = await gameSeeder.createAuthUser(nameFirstUser);
    firstUserId = userId;
    const result = await useCaseConnection.execute({ userId });
    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(InterlayerNotice);
    expect(result.data.firstPlayerProgress).toBeDefined();
    expect(result.data.firstPlayerProgress.player).toBeDefined();
    expect(result.data.firstPlayerProgress.player.login).toBe(nameFirstUser);
    expect(result.data.secondPlayerProgress).toBeNull();
    expect(result.data.questions).toBeNull();
    expect(result.data.startGameDate).toBeNull();
    expect(result.data.finishGameDate).toBeNull();
    expect(result.data.status).toBe(GameStatus.Pending);
  });

  it('Returns started existing pair', async () => {
    //create questions
    const arrayQuestions = questionTestSeeder
      .createElevenQuestionsDTO()
      .map((dto) => Question.create(dto.body, dto.correctAnswers));
    await questionsRepository.createQuestions(arrayQuestions);

    //we need second authorization user
    const nameFirstUser = 'FirstUser';
    const nameSecondUser = 'SecondUser';
    const gameSeeder = gameTestSeeder(bcryptService, usersRepository);
    const userId = await gameSeeder.createAuthUser(nameSecondUser);

    const result = await useCaseConnection.execute({ userId });
    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(InterlayerNotice);

    //check first user
    expect(result.data.firstPlayerProgress).toBeDefined();
    expect(result.data.firstPlayerProgress.player).toBeDefined();
    expect(result.data.firstPlayerProgress.player.login).toBe(nameFirstUser);
    //check second user
    expect(result.data.secondPlayerProgress).toBeDefined();
    expect(result.data.secondPlayerProgress.player).toBeDefined();
    expect(result.data.secondPlayerProgress.player.login).toBe(nameSecondUser);

    expect(result.data.questions.length).toBe(5);
    expect(result.data.startGameDate).not.toBeNull();
    expect(result.data.finishGameDate).toBeNull();
    expect(result.data.status).toBe(GameStatus.Active);
  });
  it('current user is already participating in active pair', async () => {
    const result = await useCaseConnection.execute({ userId: firstUserId });
    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(InterlayerNotice);
    expect(result.hasError()).toBeTruthy();
    expect(result.code).toBe(403);
  });
});
