import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class CheckTheAnswersCommand {
  constructor(public userId: string) {}
}

@CommandHandler(CheckTheAnswersCommand)
export class CheckTheAnswersUseCase
  implements ICommandHandler<CheckTheAnswersCommand>
{
  constructor() {}

  async execute(command: CheckTheAnswersCommand) {}
}
