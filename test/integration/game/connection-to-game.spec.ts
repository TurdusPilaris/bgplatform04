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

describe('connection to game', () => {
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
    await testingController.allDelete();
  });

  afterAll(async () => {
    await app.close();
  });

  it('create new game, when not existing random pending pair', async () => {
    //we need authorization user
    const gameSeeder = gameTestSeeder(bcryptService, usersRepository);
    const userId = await gameSeeder.createAuthUser('FirstUser');

    const result = await useCaseConnection.execute({ userId });
    expect(result).toBeDefined();
    expect(result.firstPlayerProgress).toBeDefined();
    expect(result.firstPlayerProgress.player).toBeDefined();
    expect(result.firstPlayerProgress.player.id).toBe(userId);
    expect(result.secondPlayerProgress).toBeNull();
    expect(result.questions).toBeNull();
    expect(result.startGameDate).toBeNull();
    expect(result.finishGameDate).toBeNull();
    expect(result.status).toBe(GameStatus.Pending);
  });
});
