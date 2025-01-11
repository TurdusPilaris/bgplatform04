import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuestionsRepository } from '../../../infractructure/questions.repository';
import { InterlayerNotice } from '../../../../../base/models/Interlayer';

export class DeleteQuestionCommand {
  constructor(public id: string) {}
}

@CommandHandler(DeleteQuestionCommand)
export class DeleteQuestionUseCase
  implements ICommandHandler<DeleteQuestionCommand>
{
  constructor(private questionsRepository: QuestionsRepository) {}

  async execute(command: DeleteQuestionCommand): Promise<InterlayerNotice> {
    // If the question is not found, an error will be returned.
    const foundQuestion = await this.questionsRepository.findById(command.id);
    if (!foundQuestion) {
      const errorNotice = new InterlayerNotice(null);
      errorNotice.addError('Question does not exist', 'questionId', 404);
      return errorNotice;
    }
    await this.questionsRepository.deleteQuestion({ id: foundQuestion.id });
    return new InterlayerNotice();
  }
}
