import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserSQL } from '../../../user-accaunts/users/domain/entities/user.sql.entity';
import { Answer } from './answer.entity';

@Entity({ name: 'players' })
export class Player {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserSQL, (u) => u.players)
  user: UserSQL;

  @Column()
  score: number;

  @OneToMany(() => Answer, (a) => a.player)
  answers: Answer[];
}
