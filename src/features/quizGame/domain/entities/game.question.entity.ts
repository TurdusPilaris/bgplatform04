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

  static create(gameId: string, questionId: string): GameQuestion {
    const g_question = new GameQuestion();
    g_question.game = { id: gameId } as Game;
    g_question.question = { id: questionId } as Question;
    return g_question;
  }
}
