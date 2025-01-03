import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Player } from './domain/entities/player.entity';
import { Answer } from './domain/entities/answer.entity';
import { GameQuestion } from './domain/entities/game.question.entity';
import { Question } from './domain/entities/question.entity';
import { Game } from './domain/entities/game.entity';

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([Player, Answer, Game, GameQuestion, Question]),
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class QuizeGameModule {}
