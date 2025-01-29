import { gameTestSeeder } from './game.test.seeder';
import { BcryptService } from '../../../src/base/adapters/bcrypt-service';
import { UsersRepository } from '../../../src/features/user-accaunts/users/infrastructure/mongo/users.repository';
import { InterlayerNotice } from '../../../src/base/models/Interlayer';
import { Question } from '../../../src/features/quizGame/domain/entities/question.entity';
import { AnswerStatus } from '../../../src/base/models/answerStatus';

export class GameTestManager {
  constructor(
    private bcryptService: BcryptService,
    private usersRepository: UsersRepository,
  ) {}
  async createAuthUser(nameUser: string) {
    const gameSeeder = gameTestSeeder(this.bcryptService, this.usersRepository);
    return gameSeeder.createAuthUser(nameUser);
  }
  checkForA403Error(result: any) {
    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(InterlayerNotice);
    expect(result.hasError()).toBeTruthy();
    expect(result.code).toBe(403);
  }
  checkCorrectAnswer(result: any) {
    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(InterlayerNotice);
    expect(result.data).toBeDefined();
    expect(result.data.questionId).toBeDefined();
    expect(result.data.addedAt).toBeDefined();
    expect(result.data.answerStatus).toBe(AnswerStatus.Correct);
  }

  checkIncorrectAnswer(result: any) {
    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(InterlayerNotice);
    expect(result.data).toBeDefined();
    expect(result.data.questionId).toBeDefined();
    expect(result.data.addedAt).toBeDefined();
    expect(result.data.answerStatus).toBe(AnswerStatus.Incorrect);
  }
  async getCorrectAnswer(
    numberAnswer: number,
    arrayAllQuestions: Question[],
    actualQuestion: any[],
  ) {
    const currentQuestion = arrayAllQuestions.find(
      (q) => q.body === actualQuestion[numberAnswer - 1].body,
    );
    return currentQuestion.answers[0];
  }
}
