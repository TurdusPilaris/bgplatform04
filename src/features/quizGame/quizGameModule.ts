import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Player } from './domain/entities/player.entity';
import { Answer } from './domain/entities/answer.entity';
import { GameQuestion } from './domain/entities/game.question.entity';
import { Question } from './domain/entities/question.entity';
import { Game } from './domain/entities/game.entity';
import { QuestionsRepository } from './infractructure/questions.repository';
import { QuestionsQueryRepository } from './infractructure/questions.query-repository';
import { QuizSaController } from './api/controllers/quiz.sa.controller';
import { PairGameQuizController } from './api/controllers/pair.game.quiz.controller';
import { CreateQuestionUseCase } from './application/use-cases/questions/create-question-use-case';
import { DeleteQuestionUseCase } from './application/use-cases/questions/delete-question-use-case';
import { UpdateQuestionUseCase } from './application/use-cases/questions/update-question-use-case';
import { UpdatePublishQuestionUseCase } from './application/use-cases/questions/update-publish-question-use-case';
import { UserAccountsModule } from '../user-accaunts/users.accounts.module';
import { ConnectionToGameUseCase } from './application/use-cases/game/connection-to-game-use-case';
import { CheckTheAnswersUseCase } from './application/use-cases/game/check-the-answers-use-case';
import { GameRepository } from './infractructure/game.repository';
import { GameQueryRepository } from './infractructure/game.query-repository';
import { IsGameExistsAndUserParticipantUseCase } from './application/use-cases/game/is-game-exists-and-user-participant-use-case';
import { GetCurrentGameIdUseCase } from './application/use-cases/game/get-current-game-id-use-case';

const useCasesForQuestion = [
  CreateQuestionUseCase,
  DeleteQuestionUseCase,
  UpdateQuestionUseCase,
  UpdatePublishQuestionUseCase,
];
const useCasesForGame = [
  ConnectionToGameUseCase,
  CheckTheAnswersUseCase,
  IsGameExistsAndUserParticipantUseCase,
  GetCurrentGameIdUseCase,
];
@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([Player, Answer, Game, GameQuestion, Question]),
    UserAccountsModule,
  ],
  controllers: [QuizSaController, PairGameQuizController],
  providers: [
    ...useCasesForQuestion,
    ...useCasesForGame,
    QuestionsRepository,
    GameRepository,
    GameQueryRepository,
    QuestionsQueryRepository,
  ],
  exports: [],
})
export class QuizGameModule {}
