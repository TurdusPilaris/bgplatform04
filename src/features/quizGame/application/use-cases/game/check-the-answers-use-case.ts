import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GameRepository } from '../../../infractructure/game.repository';
import { InterlayerNotice } from '../../../../../base/models/Interlayer';
import { AnswerStatus } from '../../../../../base/models/answerStatus';
import { Answer } from '../../../domain/entities/answer.entity';
import { AnswerViewModel } from '../../../api/models/output/game/answer.view.model';
import { Player } from '../../../domain/entities/player.entity';
import { PlayerStatus } from '../../../../../base/models/playerStatus';

export class CheckTheAnswersCommand {
  constructor(
    public userId: string,
    public answer: string,
  ) {}
}

@CommandHandler(CheckTheAnswersCommand)
export class CheckTheAnswersUseCase
  implements ICommandHandler<CheckTheAnswersCommand>
{
  constructor(private gameRepository: GameRepository) {}

  async execute(command: CheckTheAnswersCommand) {
    //first find active game
    const activeGame = await this.gameRepository.findActiveGame({
      currentUserId: command.userId,
    });
    if (!activeGame) {
      const errorNotice = new InterlayerNotice(null);
      errorNotice.addError(
        'current user is not inside active pair',
        'game',
        403,
      );
      return errorNotice;
    }
    const currentPlayer =
      command.userId === activeGame.player_1.user.id
        ? activeGame.player_1
        : activeGame.player_2;

    const opponentPlayer =
      currentPlayer === activeGame.player_1
        ? activeGame.player_2
        : activeGame.player_1;
    //find player and find count him answers
    const player = await this.gameRepository.findPlayerWithCountAnswers({
      playerId: currentPlayer.id,
    });

    if (player.answersCount === 5) {
      const errorNotice = new InterlayerNotice(null);
      errorNotice.addError(
        ' user is in active pair but has already answered to all questions',
        'game',
        403,
      );
      return errorNotice;
    }

    //find current question
    const currentQuestion =
      await this.gameRepository.findCurrentQuestionForGame({
        gameId: activeGame.id,
        ordinalNumber: player.answersCount,
      });
    //check if the player's answer is correct
    const statusAnswer = currentQuestion.answers.includes(command.answer)
      ? AnswerStatus.Correct
      : AnswerStatus.Incorrect;
    // if the player's answer is correct then increase the score
    if (statusAnswer === AnswerStatus.Correct) {
      await this.gameRepository.increaseScoreForPlayer({ playerId: player.id });
    }

    //create an Answer entity for the player
    const createdAnswer = await this.createAnswerForPlayer(
      player.id,
      currentQuestion.questionId,
      statusAnswer,
      command.answer,
    );

    //if this is not the last question return view model
    if (player.answersCount < 4) {
      return new InterlayerNotice(
        this.createViewModel(
          currentQuestion.questionId,
          statusAnswer,
          createdAnswer.createdAt,
        ),
      );
    }

    //Checking that the second player has answered 5 questions

    //find player and find count him answers
    const opponentPlayerWithCountAnswers =
      await this.gameRepository.findPlayerWithCountAnswers({
        playerId: opponentPlayer.id,
      });

    //If the second player hasn't finished the game, return a response
    if (opponentPlayerWithCountAnswers.answersCount < 5) {
      return new InterlayerNotice(
        this.createViewModel(
          currentQuestion.questionId,
          statusAnswer,
          createdAnswer.createdAt,
        ),
      );
    }

    //calculating the bonus
    await this.calculatingTheBonus({
      currentPlayer: currentPlayer,
      opponentPlayer: opponentPlayer,
      gameId: activeGame.id,
      questionId: currentQuestion.questionId,
    });

    //finish the game
    await this.gameRepository.finishGame(activeGame.id);

    //return response
    return new InterlayerNotice(
      this.createViewModel(
        currentQuestion.questionId,
        statusAnswer,
        createdAnswer.createdAt,
      ),
    );
  }

  async createAnswerForPlayer(
    playerId: string,
    questionId: string,
    statusAnswer: AnswerStatus,
    playerAnswer: string,
  ) {
    const answer = Answer.create(
      playerId,
      questionId,
      statusAnswer,
      playerAnswer,
    );
    return this.gameRepository.createAnswer(answer);
  }

  createViewModel(
    questionId: string,
    answerStatus: AnswerStatus,
    addedAt: Date,
  ): AnswerViewModel {
    return {
      questionId: questionId,
      answerStatus: answerStatus,
      addedAt: addedAt.toISOString(),
    };
  }

  private async calculatingTheBonus(param: {
    currentPlayer: Player;
    opponentPlayer: Player;
    gameId: string;
    questionId: string;
  }) {
    const result = await this.gameRepository.getBonus({
      currentPlayerId: param.currentPlayer.id,
      opponentId: param.opponentPlayer.id,
      gameId: param.gameId,
      questionId: param.questionId,
    });

    if (result.bonusOfPlayer1 && param.currentPlayer.score > 0) {
      await this.gameRepository.increaseScoreForPlayer({
        playerId: param.currentPlayer.id,
      });
    }
    if (result.bonusOfPlayer2 && param.opponentPlayer.score > 0) {
      await this.gameRepository.increaseScoreForPlayer({
        playerId: param.opponentPlayer.id,
      });
    }
    if (
      result.bonusOfPlayer1 + param.currentPlayer.score >
      result.bonusOfPlayer2 + param.opponentPlayer.score
    ) {
      await this.gameRepository.updatePlayerStatus({
        playerId: param.currentPlayer.id,
        playerStatus: PlayerStatus.Winner,
      });
      await this.gameRepository.updatePlayerStatus({
        playerId: param.opponentPlayer.id,
        playerStatus: PlayerStatus.Loser,
      });
      return;
    }
    if (
      result.bonusOfPlayer2 + param.opponentPlayer.score >
      result.bonusOfPlayer1 + param.currentPlayer.score
    ) {
      await this.gameRepository.updatePlayerStatus({
        playerId: param.currentPlayer.id,
        playerStatus: PlayerStatus.Loser,
      });
      await this.gameRepository.updatePlayerStatus({
        playerId: param.opponentPlayer.id,
        playerStatus: PlayerStatus.Winner,
      });
      return;
    }
    if (
      result.bonusOfPlayer2 + param.opponentPlayer.score ===
      result.bonusOfPlayer1 + param.currentPlayer.score
    ) {
      await this.gameRepository.updatePlayerStatus({
        playerId: param.currentPlayer.id,
        playerStatus: PlayerStatus.Draw,
      });
      await this.gameRepository.updatePlayerStatus({
        playerId: param.opponentPlayer.id,
        playerStatus: PlayerStatus.Draw,
      });
      return;
    }
  }
}
