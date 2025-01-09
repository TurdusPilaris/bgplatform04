import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuestionsRepository } from '../../../infractructure/questions.repository';
import { InterlayerNotice } from '../../../../../base/models/Interlayer';

export class DeleteQuestionCommand {
  constructor(public id: string) {}
}

@CommandHandler(DeleteQuestionCommand)
export class DeleteQuestionUseCases
  implements ICommandHandler<DeleteQuestionCommand>
{
  constructor(private questionsRepository: QuestionsRepository) {}

  async execute(command: DeleteQuestionCommand) {
    return new InterlayerNotice();
  }
}
