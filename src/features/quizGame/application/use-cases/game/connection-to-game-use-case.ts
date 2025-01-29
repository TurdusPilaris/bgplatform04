import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GameRepository } from '../../../infractructure/game.repository';
import { Player } from '../../../domain/entities/player.entity';
import { Game } from '../../../domain/entities/game.entity';
import { InterlayerNotice } from '../../../../../base/models/Interlayer';
import { QuestionsRepository } from '../../../infractructure/questions.repository';
import { Question } from '../../../domain/entities/question.entity';
import { GameQuestion } from '../../../domain/entities/game.question.entity';
import { GameQueryRepository } from '../../../infractructure/game.query-repository';

export class ConnectionToGameCommand {
  constructor(public userId: string) {}
}

@CommandHandler(ConnectionToGameCommand)
export class ConnectionToGameUseCase
  implements ICommandHandler<ConnectionToGameCommand>
{
  constructor(
    private gameRepository: GameRepository,
    private questionRepository: QuestionsRepository,
    private gameQueryRepository: GameQueryRepository,
  ) {}
  async execute(
    command: ConnectionToGameCommand,
  ): Promise<InterlayerNotice<string | null>> {
    //first find active game
    const activeGame = await this.gameRepository.findActiveGame({
      currentUserId: command.userId,
    });
    if (activeGame) {
      const errorNotice = new InterlayerNotice(null);
      errorNotice.addError(
        'current user is already participating in active pair',
        'game',
        403,
      );
      return errorNotice;
    }
    //find game with status "PendingSecondPlayer"
    const gamePendingSecondPlayer = await this.gameRepository.findPendingGame();

    if (!gamePendingSecondPlayer) {
      return this.createNewGame(command.userId);
    }

    //user is already in the pending game
    if (gamePendingSecondPlayer.userForPlayer1 === command.userId) {
      const errorNotice = new InterlayerNotice(null);
      errorNotice.addError(
        'current user is already in the pending game',
        'game',
        403,
      );
      return errorNotice;
    }

    return this.fixPairForGame(command.userId, gamePendingSecondPlayer.id);
  }
  async createNewGame(userId: string): Promise<InterlayerNotice<string>> {
    //create new player
    const newPlayer = Player.create(userId);
    const createdPlayer = await this.gameRepository.savePlayer(newPlayer);
    //create pending game
    const pendingGame = Game.createPendingGame(createdPlayer.id);
    const createdGame = await this.gameRepository.saveGame(pendingGame);
    const createdGameForView =
      await this.gameQueryRepository.findGameWithLoginUser(createdGame.id);

    //return view model
    return new InterlayerNotice(createdGameForView.id);
  }
  async fixPairForGame(
    userId: string,
    currentGameId: string,
  ): Promise<InterlayerNotice<string>> {
    //create new player for second user
    const newPlayer = Player.create(userId);
    const createdSecondPlayer = await this.gameRepository.savePlayer(newPlayer);

    //update current game
    await this.gameRepository.addSecondUserAndActiveTheGame({
      currentGameId: currentGameId,
      playerId: createdSecondPlayer.id,
    });

    const activeGame = await this.gameRepository.findGameById({
      id: currentGameId,
    });

    const activeGameForView =
      await this.gameQueryRepository.findGameWithLoginUser(activeGame.id);
    //create questions for game
    const fiveRandomQuestions: Question[] =
      await this.questionRepository.getFiveRandomPublishQuestions();

    const arrayForQuestion = fiveRandomQuestions.map((q) =>
      GameQuestion.create(activeGame.id, q.id),
    );

    await this.gameRepository.saveQuestionsForGame(arrayForQuestion);

    //create five game question
    return new InterlayerNotice(activeGameForView.id);
  }
}
