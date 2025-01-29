import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GameRepository } from '../../../infractructure/game.repository';
import { InterlayerNotice } from '../../../../../base/models/Interlayer';

export class IsGameExistsAndUserParticipantCommand {
  constructor(
    public userId: string,
    public gameId: string,
  ) {}
}

@CommandHandler(IsGameExistsAndUserParticipantCommand)
export class IsGameExistsAndUserParticipantUseCase
  implements ICommandHandler<IsGameExistsAndUserParticipantCommand>
{
  constructor(private gameRepository: GameRepository) {}

  async execute(command: IsGameExistsAndUserParticipantCommand) {
    const foundGame = await this.gameRepository.findGameById({
      id: command.gameId,
    });

    if (!foundGame) {
      const errorNotice = new InterlayerNotice(null);
      errorNotice.addError('game not found', 'game', 404);
      return errorNotice;
    }
    const foundGameForUser = await this.gameRepository.findGameForUser({
      currentUserId: command.userId,
      gameId: command.gameId,
    });

    if (!foundGameForUser) {
      const errorNotice = new InterlayerNotice(null);
      errorNotice.addError(
        'current user tries to get pair in which user is not participant',
        'game',
        403,
      );
      return errorNotice;
    }
    return new InterlayerNotice(null);
  }
}
