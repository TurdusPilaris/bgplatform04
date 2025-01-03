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
  status: AnswerStatus;

  // static create(
  //   body: string,
  //   answers: (number | string | boolean)[],
  // ): Question {
  //   const question = new Question();
  //   question.body = body;
  //   question.answers = answers;
  //   return question;
  // }
}
