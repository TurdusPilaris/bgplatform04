import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { AuthBearerGuard } from '../../../../infrastructure/guards/auth.bearer.guard';
import { Request } from 'express';
import { ConnectionToGameCommand } from '../../application/use-cases/game/connection-to-game-use-case';
import { CheckTheAnswersCommand } from '../../application/use-cases/game/check-the-answers-use-case';
import { ErrorProcessor } from '../../../../base/models/errorProcessor';
import { AnswerInputModel } from '../models/input/question/answer.input.model';
import { IsGameExistsAndUserParticipantCommand } from '../../application/use-cases/game/is-game-exists-and-user-participant-use-case';
import { GameQueryRepository } from '../../infractructure/game.query-repository';
import { GetCurrentGameIdCommand } from '../../application/use-cases/game/get-current-game-id-use-case';
import { QueryMyInputModel } from '../models/input/question/query.my.input.model';

@Controller('pair-game-quiz')
@UseGuards(AuthBearerGuard)
export class PairGameQuizController {
  constructor(
    private commandBus: CommandBus,
    protected gameQueryRepository: GameQueryRepository,
  ) {}

  @Get('pairs/my-current')
  @HttpCode(200)
  async getCurrentGameForUser(@Req() req: Request) {
    const result = await this.commandBus.execute(
      new GetCurrentGameIdCommand(req.userId),
    );
    if (result.hasError()) {
      new ErrorProcessor(result).handleError();
    } else {
      return await this.gameQueryRepository.findGameById({ id: result.data });
    }
  }

  @Get('pairs/my')
  @HttpCode(200)
  async getHistoryGamesForUser(
    @Req() req: Request,
    @Query()
    queryDto: QueryMyInputModel,
  ) {
    return await this.gameQueryRepository.findHistoryForUser({
      queryDto: queryDto,
      userId: req.userId,
    });
  }

  @Get('users/my-statistic')
  @HttpCode(200)
  async getStatisticForUser(
    @Req() req: Request,
    @Query()
    queryDto: QueryMyInputModel,
  ) {
    return await this.gameQueryRepository.findStatisticForUser({
      queryDto: queryDto,
      userId: req.userId,
    });
  }
  @Get('pairs/:id')
  @HttpCode(200)
  async getGameById(
    @Param('id', new ParseUUIDPipe())
    gameId: string,
    @Req() req: Request,
  ) {
    const result = await this.commandBus.execute(
      new IsGameExistsAndUserParticipantCommand(req.userId, gameId),
    );

    if (result.hasError()) {
      new ErrorProcessor(result).handleError();
    } else {
      return await this.gameQueryRepository.findGameById({ id: gameId });
    }
  }

  @Post('pairs/connection')
  @HttpCode(200)
  async connection(@Req() req: Request) {
    const result = await this.commandBus.execute(
      new ConnectionToGameCommand(req.userId),
    );
    if (result.hasError()) {
      new ErrorProcessor(result).handleError();
    } else {
      return await this.gameQueryRepository.findGameById({ id: result.data });
    }
  }

  @Post('pairs/my-current/answers')
  @HttpCode(200)
  async answers(@Req() req: Request, @Body() inputModel: AnswerInputModel) {
    const result = await this.commandBus.execute(
      new CheckTheAnswersCommand(req.userId, inputModel.answer),
    );
    if (result.hasError()) {
      new ErrorProcessor(result).handleError();
    } else {
      return result.data;
    }
  }
}
