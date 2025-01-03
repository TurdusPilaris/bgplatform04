import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Answer } from './answer.entity';
import { GameQuestion } from './game.question.entity';

@Entity({ name: 'questions' })
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  body: string;

  @Column('simple-json') // Используется для хранения массива в JSON-формате
  answers: (number | string | boolean)[];

  @OneToMany(() => Answer, (a) => a.question)
  answersPlayers: Answer[];

  @OneToMany(() => GameQuestion, (a) => a.question)
  gameQuestions: GameQuestion[];

  static create(
    body: string,
    answers: (number | string | boolean)[],
  ): Question {
    const question = new Question();
    question.body = body;
    question.answers = answers;
    return question;
  }
}
