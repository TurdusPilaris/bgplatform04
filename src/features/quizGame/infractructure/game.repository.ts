import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Game } from '../domain/entities/game.entity';
import { Repository } from 'typeorm';
import { GameStatus } from '../../../base/models/gameStatus';
import { Player } from '../domain/entities/player.entity';
import { GameQuestion } from '../domain/entities/game.question.entity';

@Injectable()
export class GameRepository {
  constructor(
    @InjectRepository(Game)
    private readonly gameRepository: Repository<Game>,
    @InjectRepository(Player)
    private readonly playerRepository: Repository<Player>,
    @InjectRepository(GameQuestion)
    private readonly gameQuestionRepository: Repository<GameQuestion>,
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
}
