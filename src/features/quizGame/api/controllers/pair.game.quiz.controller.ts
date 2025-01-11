import {
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { QuestionsQueryRepository } from '../../infractructure/questions.query-repository';
import { AuthBearerGuard } from '../../../../infrastructure/guards/auth.bearer.guard';
import { Request } from 'express';
import { ConnectionToGameCommand } from '../../application/use-cases/game/connection-to-game-use-case';
import { CheckTheAnswersCommand } from '../../application/use-cases/game/check-the-answers-use-case';
import { ErrorProcessor } from '../../../../base/models/errorProcessor';

@Controller('pair-game-quiz')
@UseGuards(AuthBearerGuard)
export class PairGameQuizController {
  constructor(
    private commandBus: CommandBus,
    protected questionsQueryRepository: QuestionsQueryRepository,
  ) {}

  @Get('pairs/my-current')
  @HttpCode(200)
  async getCurrentGameForUser(@Req() req: Request) {}

  @Get('pairs/:id')
  @HttpCode(200)
  async getGameForUser(
    @Param('id', new ParseUUIDPipe())
    gameId: string,
    @Req() req: Request,
  ) {}

  @Post()
  @HttpCode(200)
  async connection(@Req() req: Request) {
    const result = await this.commandBus.execute(
      new ConnectionToGameCommand(req.userId),
    );
    if (result.hasError()) {
      new ErrorProcessor(result).handleError();
    } else {
      return result.data;
    }
  }

  @Post()
  @HttpCode(200)
  async answers(@Req() req: Request) {
    const result = await this.commandBus.execute(
      new CheckTheAnswersCommand(req.userId),
    );
    if (result.hasError()) {
      new ErrorProcessor(result).handleError();
    } else {
      return result.data;
    }
  }
}
