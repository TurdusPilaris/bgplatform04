import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuestionsRepository } from '../../../infractructure/questions.repository';
import { Question } from '../../../domain/entities/question.entity';

export class CreateQuestionCommand {
  constructor(
    public body: string,
    public correctAnswers: string[],
  ) {}
}

@CommandHandler(CreateQuestionCommand)
export class CreateQuestionUseCase
  implements ICommandHandler<CreateQuestionCommand>
{
  constructor(private questionsRepository: QuestionsRepository) {}

  async execute(command: CreateQuestionCommand) {
    const newQuestion = Question.create(command.body, command.correctAnswers);
    const createdQuestion =
      await this.questionsRepository.createQuestion(newQuestion);
    return { id: createdQuestion.id };
  }
}
