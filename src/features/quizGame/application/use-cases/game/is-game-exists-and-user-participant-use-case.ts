import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GameRepository } from '../../../infractructure/game.repository';
import { InterlayerNotice } from '../../../../../base/models/Interlayer';
import { GameErrorCodes } from '../../../../../base/models/error-codes/game.error.codes.enum';

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
    const ENTITY_GAME = 'game';
    const foundGame = await this.gameRepository.findGameById({
      id: command.gameId,
    });

    if (!foundGame) {
      return InterlayerNotice.createErrorNotice(
        GameErrorCodes.NOT_FOUND,
        ENTITY_GAME,
        404,
      );
    }
    const foundGameForUser = await this.gameRepository.findGameForUser({
      currentUserId: command.userId,
      gameId: command.gameId,
    });

    if (!foundGameForUser) {
      return InterlayerNotice.createErrorNotice(
        GameErrorCodes.USER_NOT_PARTICIPANT,
        ENTITY_GAME,
        403,
      );
    }
    return new InterlayerNotice(null);
  }
}
