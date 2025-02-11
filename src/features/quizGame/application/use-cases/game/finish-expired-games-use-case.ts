import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GameRepository } from '../../../infractructure/game.repository';
import { PlayerStatus } from '../../../../../base/models/playerStatus';

export class FinishExpiredGamesCommand {}

@CommandHandler(FinishExpiredGamesCommand)
export class FinishExpiredGamesUseCase
  implements ICommandHandler<FinishExpiredGamesCommand>
{
  constructor(private gameRepository: GameRepository) {}

  async execute(command: FinishExpiredGamesCommand) {
    const expiredGames = await this.gameRepository.findExpiredGame();
    for (const gameForFinish of expiredGames) {
      await this.gameRepository.finishGame(gameForFinish.gameId);
      console.log('gameForFinish', gameForFinish);
      if (gameForFinish.count_pl1 === 5) {
        await this.gameRepository.increaseScoreForPlayer({
          playerId: gameForFinish.player1,
        });
        await this.gameRepository.updatePlayerStatus({
          playerId: gameForFinish.player1,
          playerStatus: PlayerStatus.Winner,
        });
        await this.gameRepository.updatePlayerStatus({
          playerId: gameForFinish.player2,
          playerStatus: PlayerStatus.Loser,
        });
      } else {
        await this.gameRepository.increaseScoreForPlayer({
          playerId: gameForFinish.player2,
        });
        await this.gameRepository.updatePlayerStatus({
          playerId: gameForFinish.player2,
          playerStatus: PlayerStatus.Winner,
        });
        await this.gameRepository.updatePlayerStatus({
          playerId: gameForFinish.player1,
          playerStatus: PlayerStatus.Loser,
        });
      }
    }
  }
}
