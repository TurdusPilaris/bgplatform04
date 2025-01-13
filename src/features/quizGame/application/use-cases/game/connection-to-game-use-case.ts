import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GameRepository } from '../../../infractructure/game.repository';
import {
  GamePairViewModel,
  QuestionViewModel,
} from '../../../api/models/output/game/game.view.model';
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
  ): Promise<InterlayerNotice<GamePairViewModel | null>> {
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
    } else {
      return this.fixPairForGame(command.userId, gamePendingSecondPlayer);
    }
  }
  async createNewGame(
    userId: string,
  ): Promise<InterlayerNotice<GamePairViewModel>> {
    //create new player
    const newPlayer = Player.create(userId);
    const createdPlayer = await this.gameRepository.savePlayer(newPlayer);
    //create pending game
    const pendingGame = Game.createPendingGame(createdPlayer.id);
    const createdGame = await this.gameRepository.saveGame(pendingGame);
    const createdGameForView =
      await this.gameQueryRepository.findGameWithLoginUser(createdGame.id);

    //return view model
    return new InterlayerNotice(this.createViewModel(createdGameForView, null));
  }
  async fixPairForGame(
    userId: string,
    currentGame: Game,
  ): Promise<InterlayerNotice<GamePairViewModel>> {
    //create new player for second user
    const newPlayer = Player.create(userId);
    const createdSecondPlayer = await this.gameRepository.savePlayer(newPlayer);

    //update current game
    await this.gameRepository.addSecondUserAndActiveTheGame({
      currentGameId: currentGame.id,
      playerId: createdSecondPlayer.id,
    });

    const activeGame = await this.gameRepository.findGameById({
      id: currentGame.id,
    });

    const activeGameForView =
      await this.gameQueryRepository.findGameWithLoginUser(activeGame.id);
    //create questions for game
    const fiveRandomQuestions: Question[] =
      await this.questionRepository.getFiveRandomQuestions();

    const arrayForQuestion = fiveRandomQuestions.map((q) =>
      GameQuestion.create(activeGame.id, q.id),
    );

    await this.gameRepository.saveQuestionsForGame(arrayForQuestion);

    const questionsForGameForView =
      await this.gameQueryRepository.findQuestionGameForView(
        arrayForQuestion.map((q) => q.id),
      );

    const questionsForViewModel = questionsForGameForView.map((qg) => ({
      id: qg.id.toString(),
      body: qg.question.body,
    }));
    //create five game question
    return new InterlayerNotice(
      this.createViewModel(activeGameForView, questionsForViewModel),
    );
  }
  createViewModel(game: Game, questions: QuestionViewModel[] | null) {
    return {
      id: game.id,
      firstPlayerProgress: {
        answers: [],
        player: {
          id: game.player_1.id,
          login: game.player_1.user.userName,
        },
        score: 0,
      },

      secondPlayerProgress: !game.player_2
        ? null
        : {
            answers: [],
            player: {
              id: game.player_2.id,
              login: game.player_2.user.userName,
            },
            score: 0,
          },
      questions: questions,
      status: game.status,
      pairCreatedDate: game.createdAt.toISOString(),
      startGameDate: !game.player_2 ? null : game.startGameDate.toISOString(),
      finishGameDate: null,
    };
  }
}
