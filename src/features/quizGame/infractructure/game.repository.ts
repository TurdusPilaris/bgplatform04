import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Game } from '../domain/entities/game.entity';
import { Repository } from 'typeorm';
import { GameStatus } from '../../../base/models/gameStatus';
import { Player } from '../domain/entities/player.entity';
import { GameQuestion } from '../domain/entities/game.question.entity';
import { Answer } from '../domain/entities/answer.entity';

@Injectable()
export class GameRepository {
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

  async findPendingGame(): Promise<Game> {
    return this.gameRepository.findOneBy({
      status: GameStatus.Pending,
    });
  }
  async savePlayer(player: Player) {
    return this.playerRepository.save(player);
  }
  async saveGame(game: Game) {
    return this.gameRepository.save(game);
  }

  async addSecondUserAndActiveTheGame(param: {
    currentGameId: string;
    playerId: string;
  }) {
    await this.gameRepository.update(
      { id: param.currentGameId },
      {
        status: GameStatus.Active,
        player_2: { id: param.playerId },
        startGameDate: new Date(),
      },
    );
  }
  async findGameById(param: { id: string }) {
    return this.gameRepository.findOneBy({ id: param.id });
  }

  async findActiveGame(param: { currentUserId: string }) {
    return this.gameRepository
      .createQueryBuilder('game')
      .leftJoinAndSelect('game.player_1', 'player1')
      .leftJoinAndSelect('player1.user', 'user1')
      .leftJoinAndSelect('game.player_2', 'player2')
      .leftJoinAndSelect('player2.user', 'user2')
      .where('(user1.id = :userId OR user2.id = :userId)', {
        userId: param.currentUserId,
      })
      .andWhere('game.status = :status', { status: GameStatus.Active })
      .getOne();
  }

  async saveQuestionsForGame(arrayForQuestion: GameQuestion[]) {
    return this.gameQuestionRepository.save(arrayForQuestion);
  }

  async findPlayerWithCountAnswers(param: {
    playerId: string;
  }): Promise<{ id: string; answersCount: number }> {
    // const subQuery
    const res = await this.playerRepository
      .createQueryBuilder('players')
      .leftJoin('players.answers', 'answers')
      .addSelect('count(answers.id)', 'answersCount')
      .where('players.id =:playerId', { playerId: param.playerId })
      .groupBy('players.id')
      .getRawOne();
    return { id: res.players_id, answersCount: res.answersCount };
  }

  async increaseScoreForPlayer(param: { playerId: string }) {
    await this.playerRepository
      .createQueryBuilder()
      .update(Player)
      .set({ score: () => 'score + 1' })
      .where('id = :playerId', { playerId: param.playerId })
      .execute();
  }
  async findCurrentQuestionForGame(param: {
    gameId: string;
    ordinalNumber: number;
  }): Promise<{ id: string; answers: string[]; questionId: string }> {
    const result = await this.gameQuestionRepository
      .createQueryBuilder('gq')
      .leftJoin('gq.question', 'q')
      .where('gq.gameId = :gameId', { gameId: param.gameId })
      .orderBy('gq.id', 'ASC')
      .offset(param.ordinalNumber)
      .select(['gq.id', 'gq.questionId', 'q.answers'])
      .getRawOne();

    return {
      id: result.gq_id,
      answers: result.q_answers,
      questionId: result.questionId,
    };
  }

  async createAnswer(answer: Answer): Promise<Answer> {
    return this.answerRepository.save(answer);
  }

  async getBonus(param: {
    currentPlayerId: string;
    opponentId: string;
    gameId: string;
  }) {
    const queryBuilder = this.answerRepository
      .createQueryBuilder('ap1')
      .leftJoin('answers', 'ap2', 'ap1.questionId = ap2.questionId')
      .select(
        'SUM(CASE when ap1.createdAt > ap2.createdAt then 1 else 0 end)',
        'bonusOfPlayer',
      )
      // .addSelect(
      //   'SUM(CASE when ap2.createdAt > ap1.createdAt then 1 else 0 end)',
      //   'bonusPlayer2',
      // )
      .where('ap1.playerId =:currentPlayerId', {
        currentPlayerId: param.currentPlayerId,
      })
      .andWhere('ap2.playerId =:opponentId', { opponentId: param.opponentId });

    const res = await queryBuilder.getRawOne();

    return { bonusOfPlayer: +res.bonusOfPlayer };
  }

  async finishGame(id: string) {
    await this.gameRepository.update(
      { id: id },
      { status: GameStatus.Finished, finishGameDate: new Date() },
    );
  }
}
