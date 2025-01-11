import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Game } from '../domain/entities/game.entity';
import { In, Repository } from 'typeorm';
import { GameStatus } from '../../../base/models/gameStatus';
import { Player } from '../domain/entities/player.entity';
import { GameQuestion } from '../domain/entities/game.question.entity';

@Injectable()
export class GameQueryRepository {
  constructor(
    @InjectRepository(Game)
    private readonly gameRepository: Repository<Game>,
    @InjectRepository(Player)
    private readonly playerRepository: Repository<Player>,
    @InjectRepository(GameQuestion)
    private readonly gameQuestionRepository: Repository<GameQuestion>,
  ) {}

  async findGameWithLoginUser(id: string) {
    return this.gameRepository.findOne({
      where: { id: id },
      relations: ['player_1', 'player_2', 'player_1.user', 'player_2.user'],
    });
  }

  async findQuestionGameForView(ids: number[]) {
    return this.gameQuestionRepository.find({
      where: { id: In(ids) },
      relations: ['question'],
    });
  }
}
