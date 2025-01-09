import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuestionsRepository } from '../../../infractructure/questions.repository';

export class UpdatePublishQuestionCommand {
  constructor(
    public id: string,
    public published: boolean,
  ) {}
}

@CommandHandler(UpdatePublishQuestionCommand)
export class UpdatePublishQuestionUseCases
  implements ICommandHandler<UpdatePublishQuestionCommand>
{
  constructor(private questionsRepository: QuestionsRepository) {}

  async execute(command: UpdatePublishQuestionCommand) {}
}
