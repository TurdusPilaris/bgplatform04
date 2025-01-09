import { Controller } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { QuestionsQueryRepository } from '../../infractructure/questions.query-repository';

@Controller('pair-game-quiz')
export class PairGameQuizController {
  constructor(
    private commandBus: CommandBus,
    protected questionsQueryRepository: QuestionsQueryRepository,
  ) {}
}
