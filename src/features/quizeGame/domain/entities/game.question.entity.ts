import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Game } from './game.entity';
import { Question } from './question.entity';

@Entity({ name: 'gameQuestions' })
export class GameQuestion {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => Game, (g) => g.questions)
  game: Game;

  @ManyToOne(() => Question, (g) => g.gameQuestions)
  question: Question;

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
