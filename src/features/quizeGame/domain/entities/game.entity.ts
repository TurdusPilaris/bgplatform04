import { Column, Entity, OneToMany, OneToOne } from 'typeorm';
import { BaseDBEntity } from '../../../../base/domain/entities/baseDBEntity';
import { GameStatus } from '../../../../base/models/gameStatus';
import { Player } from './player.entity';
import { GameQuestion } from './game.question.entity';

@Entity({ name: 'games' })
export class Game extends BaseDBEntity {
  @Column()
  status: GameStatus;

  @OneToOne(() => Player)
  player_1: Player;

  @OneToOne(() => Player)
  player_2: Player;

  @OneToMany(() => GameQuestion, (q) => q.game)
  questions: GameQuestion[];
}
