import { Column, Entity, OneToMany } from 'typeorm';
import { Answer } from './answer.entity';
import { GameQuestion } from './game.question.entity';
import { BaseDBEntity } from '../../../../base/domain/entities/baseDBEntity';

@Entity({ name: 'questions' })
export class Question extends BaseDBEntity {
  @Column()
  body: string;

  @Column('simple-json') // Используется для хранения массива в JSON-формате
  answers: string[];

  @Column({ default: false })
  published: boolean;

  @OneToMany(() => Answer, (a) => a.question)
  answersPlayers: Answer[];

  @OneToMany(() => GameQuestion, (a) => a.question)
  gameQuestions: GameQuestion[];

  static create(body: string, answers: string[]): Question {
    const question = new Question();
    question.body = body;
    question.answers = answers;
    return question;
  }
}
