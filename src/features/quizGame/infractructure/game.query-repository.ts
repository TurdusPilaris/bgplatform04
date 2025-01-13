import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Game } from '../domain/entities/game.entity';
import { In, Repository } from 'typeorm';
import { GameStatus } from '../../../base/models/gameStatus';
import { Player } from '../domain/entities/player.entity';
import { GameQuestion } from '../domain/entities/game.question.entity';
import { Answer } from '../domain/entities/answer.entity';
import {
  AnswersViewModel,
  GamePairViewModel,
  QuestionViewModel,
} from '../api/models/output/game/game.view.model';

@Injectable()
export class GameQueryRepository {
  constructor(
    @InjectRepository(Game)
    private readonly gameRepository: Repository<Game>,
    @InjectRepository(Player)
    private readonly playerRepository: Repository<Player>,
    @InjectRepository(GameQuestion)
    private readonly gameQuestionRepository: Repository<GameQuestion>,
    @InjectRepository(Answer)
    private readonly answerRepository: Repository<Answer>,
  ) {}

  async findGameWithLoginUser(id: string) {
    return this.gameRepository.findOne({
      where: { id: id },
      relations: ['player_1', 'player_2', 'player_1.user', 'player_2.user'],
    });
  }

  async findGameById(param: { id: string }) {
    const resultGame = await this.gameRepository
      .createQueryBuilder('games')
      .select([
        'games.id',
        'games.status',
        'games."createdAt"',
        'games."startGameDate"',
        'games."finishGameDate"',
      ])
      //get player 1 and him addition field
      .leftJoin('players', 'pl1', 'pl1.id = games.player_1_id')
      .addSelect('pl1.id', 'player1_id')
      .addSelect('pl1.score', 'player1_score')
      .leftJoin('user_tor', 'users_pl1', 'users_pl1.id = pl1.userId')
      .addSelect('users_pl1."userName"', 'loginPlayer1')
      //get player 1 and him addition field
      .leftJoin('players', 'pl2', 'pl2.id = games.player_2_id')
      .addSelect('pl2.id', 'player2_id')
      .addSelect('pl2.score', 'player2_score')
      .leftJoin('user_tor', 'users_pl2', 'users_pl2.id = pl2.userId')
      .addSelect('users_pl2."userName"', 'loginPlayer2')

      .where('games.id =:id', { id: param.id })
      .getRawOne();

    const resAnswersForPlayer1 = await this.answerRepository
      .createQueryBuilder()
      .select('"questionId"')
      .addSelect('status', 'answerStatus')
      .addSelect('"createdAt"', 'addedAt')
      .where('"playerId" = :playerId', { playerId: resultGame.player1_id })
      .orderBy('"createdAt"', 'ASC')
      .getRawMany();

    const resAnswersForPlayer2 = await this.answerRepository
      .createQueryBuilder()
      .select('"questionId"')
      .addSelect('status', 'answerStatus')
      .addSelect('"createdAt"', 'addedAt')
      .where('"playerId" = :playerId', { playerId: resultGame.player2_id })
      .orderBy('"createdAt"', 'ASC')
      .getRawMany();

    const resQuestions = await this.gameQuestionRepository
      .createQueryBuilder('qg')
      .leftJoin('questions', 'q', 'qg."questionId" = q.id')
      .select(['q.id', 'q.body'])
      .where('qg.gameId = :gameId', { gameId: resultGame.games_id })
      .orderBy('qg.id', 'ASC')
      .getRawMany();

    const answersForPlayer1 = resAnswersForPlayer1.map((answer) =>
      this.mapAnswersForPlayer(answer),
    );
    const answersForPlayer2 = resAnswersForPlayer2.map((answer) =>
      this.mapAnswersForPlayer(answer),
    );
    const questions = resQuestions.map((q) => this.mapQuestions(q));

    return this.mapGamePairViewModel({
      resultGame,
      answersForPlayer1,
      answersForPlayer2,
      questions,
    });
  }
  async findQuestionGameForView(ids: number[]) {
    return this.gameQuestionRepository.find({
      where: { id: In(ids) },
      relations: ['question'],
      order: { id: 'ASC' },
    });
  }
  mapAnswersForPlayer = (answer): AnswersViewModel => {
    return {
      questionId: answer.questionId,
      answerStatus: answer.answerStatus,
      addedAt: answer.addedAt.toISOString(),
    };
  };
  mapQuestions = (q): QuestionViewModel => {
    return {
      id: q.q_id,
      body: q.q_body,
    };
  };
  mapGamePairViewModel(param: {
    resultGame;
    answersForPlayer1;
    answersForPlayer2;
    questions;
  }): GamePairViewModel {
    return {
      id: param.resultGame.games_id,
      firstPlayerProgress: {
        answers: param.answersForPlayer1,
        player: {
          id: param.resultGame.player1_id,
          login: param.resultGame.loginPlayer1,
        },
        score: param.resultGame.player1_score,
      },
      secondPlayerProgress: {
        answers: param.answersForPlayer2,
        player: {
          id: param.resultGame.player2_id,
          login: param.resultGame.loginPlayer2,
        },
        score: param.resultGame.player2_score,
      },
      questions: param.questions,
      status: param.resultGame.games_status,
      pairCreatedDate: param.resultGame.createdAt.toISOString(),
      startGameDate: param.resultGame.startGameDate.toISOString(),
      finishGameDate: param.resultGame.finishGameDate.toISOString(),
    };
  }
}
