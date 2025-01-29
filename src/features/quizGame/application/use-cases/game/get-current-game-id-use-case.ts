import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GameRepository } from '../../../infractructure/game.repository';
import { InterlayerNotice } from '../../../../../base/models/Interlayer';

export class GetCurrentGameIdCommand {
  constructor(public userId: string) {}
}

@CommandHandler(GetCurrentGameIdCommand)
export class GetCurrentGameIdUseCase
  implements ICommandHandler<GetCurrentGameIdCommand>
{
  constructor(private gameRepository: GameRepository) {}

  async execute(command: GetCurrentGameIdCommand) {
    const activeGame = await this.gameRepository.findANotFinishedGame({
      currentUserId: command.userId,
    });

    if (!activeGame) {
      const errorNotice = new InterlayerNotice(null);
      errorNotice.addError(
        'current user is not inside active pair',
        'game',
        404,
      );
      return errorNotice;
    } else return new InterlayerNotice(activeGame.id);
  }
}
