import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Question } from './question.entity';
import { Player } from './player.entity';
import { AnswerStatus } from '../../../../base/models/answerStatus';
import { BaseDBEntity } from '../../../../base/domain/entities/baseDBEntity';

@Entity({ name: 'answers' })
export class Answer extends BaseDBEntity {
  @ManyToOne(() => Question, (q) => q.answers)
  question: Question;

  @ManyToOne(() => Player, (p) => p.answers)
  player: Player;

  @Column()
  body: string;

  @Column()
  status: AnswerStatus;

  static create(
    playerId: string,
    questionId: string,
    status: AnswerStatus,
    body: string,
  ): Answer {
    const answer = new Answer();
    answer.question = { id: questionId } as Question;
    answer.player = { id: playerId } as Player;
    answer.status = status;
    answer.body = body;
    return answer;
  }
}
