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
import { CreateQuestionUseCases } from './application/use-cases/questions/create-question-use-cases';
import { DeleteQuestionUseCases } from './application/use-cases/questions/delete-question-use-cases';
import { UpdateQuestionUseCases } from './application/use-cases/questions/update-question-use-cases';
import { UpdatePublishQuestionUseCases } from './application/use-cases/questions/update-publish-question-use-cases';
import { UserAccountsModule } from '../user-accaunts/users.accounts.module';

const useCasesForQuestion = [
  CreateQuestionUseCases,
  DeleteQuestionUseCases,
  UpdateQuestionUseCases,
  UpdatePublishQuestionUseCases,
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
    QuestionsRepository,
    QuestionsQueryRepository,
  ],
  exports: [],
})
export class QuizGameModule {}
